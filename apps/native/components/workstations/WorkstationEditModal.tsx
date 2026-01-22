/**
 * WorkstationEditModal: Add or edit a workstation configuration.
 *
 * For new workstations:
 * - User enters URL + secret
 * - "Test Connection" establishes temporary connection and pings Base
 * - Base responds with workstationId (lightweight - no message sync)
 * - On success, user can save (using Base's workstationId)
 *
 * For existing workstations:
 * - Edit name, URL, secret, enabled toggle
 * - Changes trigger reconnection
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { AlertTriangleIcon, CheckCircleIcon, EyeIcon, EyeOffIcon, Trash2Icon, XCircleIcon, XIcon } from 'lucide-react-native';
import { useUniwind } from 'uniwind';
import { useTable, useValue } from 'tinybase/ui-react';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSocketContext } from '@/lib/socket/provider';
import {
  getWorkstationSecret,
  getWorkstationEncryptionKey,
  setWorkstationEncryptionKey,
  deleteWorkstationEncryptionKey,
} from '@/lib/settings/workstations';
import type { WorkstationConfig } from '@/lib/store/hooks';
import { THEME } from '@/lib/theme';

// =============================================================================
// Helpers
// =============================================================================

/**
 * Validates if a string is a valid URL with http/https protocol
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if a valid URL uses HTTP (not HTTPS)
 */
function isHttpUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:';
  } catch {
    return false;
  }
}

// =============================================================================
// Types
// =============================================================================

interface WorkstationEditModalProps {
  visible: boolean;
  /** Workstation to edit, or null to add a new one */
  workstation: WorkstationConfig | null;
  onClose: () => void;
}

interface TestResult {
  success: boolean;
  workstationId?: string;
  workstationName?: string;
  error?: string;
}

// =============================================================================
// Test Connection Hook
// =============================================================================

function useTestConnection() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTestingRef = useRef(false); // Ref to avoid stale closure in event handlers
  const deviceId = useValue('device') as string | undefined;

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const testConnection = useCallback(
    async (url: string, secret: string): Promise<TestResult> => {
      cleanup();
      setIsTesting(true);
      isTestingRef.current = true;
      setTestResult(null);

      return new Promise((resolve) => {
        const socket = io(url, {
          transports: ['websocket'],
          reconnection: false,
          timeout: 10000,
          auth: { secret },
        });
        socketRef.current = socket;

        const finishTest = (result: TestResult) => {
          cleanup();
          setTestResult(result);
          setIsTesting(false);
          isTestingRef.current = false;
          resolve(result);
        };

        // Timeout after 15 seconds
        timeoutRef.current = setTimeout(() => {
          finishTest({ success: false, error: 'Connection timeout' });
        }, 15000);

        socket.on('connect', () => {
          // Use lightweight ping instead of full init to avoid message sync
          socket.emit(
            'ping',
            (response: { pong?: boolean; workstationId?: string; timestamp?: number }) => {
              if (response?.pong && response.workstationId) {
                finishTest({
                  success: true,
                  workstationId: response.workstationId,
                });
              } else {
                finishTest({ success: false, error: 'Invalid ping response' });
              }
            }
          );
        });

        socket.on('connect_error', (err) => {
          finishTest({ success: false, error: err.message });
        });

        socket.on('disconnect', (reason) => {
          // Use ref to avoid stale closure
          if (isTestingRef.current) {
            finishTest({ success: false, error: `Disconnected: ${reason}` });
          }
        });
      });
    },
    [cleanup, deviceId]
  );

  const resetTest = useCallback(() => {
    cleanup();
    setIsTesting(false);
    isTestingRef.current = false;
    setTestResult(null);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { testConnection, isTesting, testResult, resetTest };
}

// =============================================================================
// Main Component
// =============================================================================

interface WorkstationRow {
  name?: string;
  url?: string;
  enabled?: number;
  active?: number;
}

export function WorkstationEditModal({
  visible,
  workstation,
  onClose,
}: WorkstationEditModalProps) {
  const { theme } = useUniwind();
  const colors = THEME[theme ?? 'light'];
  const { height: screenHeight } = useWindowDimensions();
  const { addWorkstation, updateWorkstation, removeWorkstation, allConnectionStates } =
    useSocketContext();

  // Get existing workstations to check for duplicates
  const workstationsTable = useTable('workstations') as Record<string, WorkstationRow>;

  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState(''); // Track original URL for edit mode
  const [secret, setSecret] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  // Encryption key state
  const [encryptionKey, setEncryptionKey] = useState('');
  const [originalEncryptionKey, setOriginalEncryptionKey] = useState('');
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);
  const [isLoadingEncryptionKey, setIsLoadingEncryptionKey] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test connection
  const { testConnection, isTesting, testResult, resetTest } = useTestConnection();

  const isEditing = workstation !== null;
  const connectionState = workstation
    ? allConnectionStates.get(workstation.id)
    : undefined;

  // Check if URL has changed from original (edit mode only)
  const urlChanged = isEditing && url.trim().toLowerCase() !== originalUrl.trim().toLowerCase();

  // Check for issues with the connection test result
  const connectionIssue = (() => {
    if (!testResult?.success || !testResult.workstationId) {
      return null;
    }

    const wsId = testResult.workstationId;
    const trimmedUrl = url.trim().toLowerCase();

    // In edit mode with URL change: verify the new Base has the same workstationId
    if (isEditing && urlChanged && workstation) {
      if (wsId !== workstation.id) {
        return `This URL points to a different Base service (ID: ${wsId.slice(0, 8)}...). To connect to a new Base, delete this workstation and add a new one.`;
      }
      // Same workstationId - URL change is OK (maybe IP changed)
      return null;
    }

    // For new workstations: check for duplicates
    if (!isEditing) {
      // Check if workstation with this ID already exists
      if (workstationsTable[wsId]) {
        const existingName = workstationsTable[wsId].name ?? wsId;
        return `A workstation "${existingName}" already exists with this Base. Please edit the existing workstation instead.`;
      }

      // Check if workstation with this URL already exists
      for (const [id, row] of Object.entries(workstationsTable)) {
        if (row.url?.toLowerCase() === trimmedUrl) {
          const existingName = row.name ?? id;
          return `A workstation "${existingName}" already uses this URL. Please edit the existing workstation instead.`;
        }
      }
    }

    return null;
  })();

  // Determine if save is allowed
  // - New workstation: need URL and secret filled
  // - Edit without URL change: always allowed
  // - Edit with URL change: need successful test confirming same Base
  const canSave = (() => {
    if (!isEditing) {
      // New workstation - just need URL and secret
      return url.trim() && secret.trim() && !connectionIssue;
    }
    if (!urlChanged) {
      // Editing without URL change - always OK
      return true;
    }
    // Editing with URL change - need test to confirm same Base
    return testResult?.success && testResult.workstationId && !connectionIssue;
  })();

  // Load existing workstation data when editing
  useEffect(() => {
    if (visible) {
      resetTest();
      setError(null);

      if (workstation) {
        setName(workstation.name);
        setUrl(workstation.url);
        setOriginalUrl(workstation.url); // Track original for change detection
        setEnabled(workstation.enabled);
        setShowSecret(false);
        setShowEncryptionKey(false);

        // Load secret from secure storage
        setIsLoadingSecret(true);
        getWorkstationSecret(workstation.id)
          .then((loadedSecret) => {
            setSecret(loadedSecret ?? '');
          })
          .finally(() => {
            setIsLoadingSecret(false);
          });

        // Load encryption key from secure storage
        setIsLoadingEncryptionKey(true);
        getWorkstationEncryptionKey(workstation.id)
          .then((loadedKey) => {
            const normalizedKey = loadedKey ?? '';
            setEncryptionKey(normalizedKey);
            setOriginalEncryptionKey(normalizedKey);
          })
          .finally(() => {
            setIsLoadingEncryptionKey(false);
          });
      } else {
        // Reset form for new workstation
        setName('');
        setUrl('');
        setOriginalUrl('');
        setSecret('');
        setEnabled(true);
        setShowSecret(false);
        setEncryptionKey('');
        setOriginalEncryptionKey('');
        setShowEncryptionKey(false);
      }
    }
  }, [visible, workstation, resetTest]);

  // Reset test result when URL or secret changes (always reset - needed for URL change validation)
  useEffect(() => {
    resetTest();
  }, [url, secret, resetTest]);

  const handleTestConnection = useCallback(async () => {
    if (!url.trim() || !secret.trim()) {
      setError('URL and secret are required');
      return;
    }
    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL (e.g., https://io43e7u.t.arc0.ai)');
      return;
    }
    setError(null);
    await testConnection(url.trim(), secret.trim());
  }, [url, secret, testConnection]);

  const handleSave = useCallback(async () => {
    // Validate
    if (!url.trim()) {
      setError('URL is required');
      return;
    }
    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL (e.g., https://io43e7u.t.arc0.ai)');
      return;
    }
    if (!isEditing && !secret.trim()) {
      setError('Secret is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let workstationId: string;

      if (isEditing && workstation) {
        // Update existing workstation
        workstationId = workstation.id;
        await updateWorkstation(workstationId, {
          name: name.trim() || workstation.name,
          url: url.trim(),
          secret: secret.trim() || undefined,
          enabled,
        });
      } else {
        // For new workstation, test connection first if not already tested
        let wsId = testResult?.workstationId;
        if (!wsId) {
          const result = await testConnection(url.trim(), secret.trim());
          if (!result.success || !result.workstationId) {
            setError(result.error || 'Failed to connect to workstation');
            setIsSaving(false);
            return;
          }
          wsId = result.workstationId;

          // Check for duplicates (inline test path - connectionIssue won't have updated yet)
          if (workstationsTable[wsId]) {
            const existingName = workstationsTable[wsId].name ?? wsId;
            setError(
              `A workstation "${existingName}" already exists with this Base. Please edit the existing workstation instead.`
            );
            setIsSaving(false);
            return;
          }

          const trimmedUrl = url.trim().toLowerCase();
          for (const [id, row] of Object.entries(workstationsTable)) {
            if (row.url?.toLowerCase() === trimmedUrl) {
              const existingName = row.name ?? id;
              setError(
                `A workstation "${existingName}" already uses this URL. Please edit the existing workstation instead.`
              );
              setIsSaving(false);
              return;
            }
          }
        }
        // Add new workstation using workstationId from Base
        workstationId = wsId;
        const workstationName = name.trim() || `Workstation ${workstationId.slice(0, 8)}`;
        await addWorkstation(workstationId, workstationName, url.trim(), secret.trim());
      }

      // Save encryption key if provided
      const trimmedEncryptionKey = encryptionKey.trim();
      const trimmedOriginalEncryptionKey = originalEncryptionKey.trim();
      if (trimmedEncryptionKey) {
        await setWorkstationEncryptionKey(workstationId, trimmedEncryptionKey);
      } else if (trimmedOriginalEncryptionKey) {
        await deleteWorkstationEncryptionKey(workstationId);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workstation');
    } finally {
      setIsSaving(false);
    }
  }, [
    isEditing,
    workstation,
    name,
    url,
    secret,
    encryptionKey,
    originalEncryptionKey,
    enabled,
    testResult,
    testConnection,
    addWorkstation,
    updateWorkstation,
    workstationsTable,
    onClose,
  ]);

  const handleDelete = useCallback(() => {
    if (!workstation) return;

    const performDelete = async () => {
      setIsDeleting(true);
      try {
        await removeWorkstation(workstation.id);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete workstation');
      } finally {
        setIsDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete workstation "${workstation.name}"? This cannot be undone.`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Workstation',
        `Delete "${workstation.name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  }, [workstation, removeWorkstation, onClose]);

  const handleClose = () => {
    if (isSaving || isDeleting || isTesting) return;
    resetTest();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <Pressable
          onPress={handleClose}
          className="flex-1 items-center justify-center bg-black/50 p-4">
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ maxHeight: screenHeight * 0.9 }}
            className="bg-card border-border w-full max-w-md rounded-xl border p-4">
            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-foreground text-lg font-semibold">
                {isEditing ? 'Edit Workstation' : 'Add Workstation'}
              </Text>
              <Pressable
                onPress={handleClose}
                disabled={isSaving || isDeleting || isTesting}
                hitSlop={8}
                className="active:opacity-70">
                <Icon as={XIcon} className="text-muted-foreground size-5" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 4 }}>
              {/* Connection Status (when editing) */}
              {isEditing && connectionState && (
                <View className="bg-muted mb-4 flex-row items-center gap-2 rounded-lg px-3 py-2">
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        connectionState.status === 'connected'
                          ? '#22c55e'
                          : connectionState.status === 'connecting'
                            ? '#f59e0b'
                            : '#ef4444',
                    }}
                  />
                  <Text className="text-muted-foreground text-sm capitalize">
                    {connectionState.status}
                  </Text>
                </View>
              )}

              {/* URL Change Warning (edit mode) */}
              {isEditing && urlChanged && !testResult && (
                <View className="bg-yellow-500/10 mb-4 flex-row items-center gap-2 rounded-lg px-3 py-2">
                  <Icon as={XCircleIcon} className="text-yellow-600" size={18} />
                  <View className="flex-1">
                    <Text className="text-yellow-600 text-sm">
                      URL changed - verification required
                    </Text>
                    <Text className="text-muted-foreground text-xs">
                      Test the connection to verify this is the same Base service.
                    </Text>
                  </View>
                </View>
              )}

              {/* Test Connection Result (when adding new OR editing with URL change) */}
              {(!isEditing || urlChanged) && testResult && (
                <View
                  className={`mb-4 flex-row items-center gap-2 rounded-lg px-3 py-2 ${
                    testResult.success && !connectionIssue ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                  <Icon
                    as={testResult.success && !connectionIssue ? CheckCircleIcon : XCircleIcon}
                    className={
                      testResult.success && !connectionIssue ? 'text-green-500' : 'text-red-500'
                    }
                    size={18}
                  />
                  <View className="flex-1">
                    <Text
                      className={`text-sm ${
                        testResult.success && !connectionIssue ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {connectionIssue
                        ? isEditing
                          ? 'Different Base service detected'
                          : 'Workstation already exists'
                        : testResult.success
                          ? 'Connected successfully'
                          : testResult.error}
                    </Text>
                    {testResult.success && testResult.workstationId && !connectionIssue && (
                      <Text className="text-muted-foreground text-xs">
                        ID: {testResult.workstationId}
                      </Text>
                    )}
                    {connectionIssue && (
                      <Text className="text-muted-foreground text-xs">{connectionIssue}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Form Fields */}
              <View className="gap-4">
                {/* Name (optional for new, shows after test) */}
                {(isEditing || testResult?.success) && (
                  <View>
                    <Text className="text-muted-foreground mb-1 text-sm">Name (optional)</Text>
                    <TextInput
                      testID="workstation-name-input"
                      value={name}
                      onChangeText={setName}
                      placeholder={
                        testResult?.workstationId
                          ? `Workstation ${testResult.workstationId.slice(0, 8)}`
                          : 'My MacBook'
                      }
                      placeholderTextColor={colors.mutedForeground}
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!isSaving && !isDeleting}
                      className="bg-background border-border text-foreground rounded-lg border px-4 py-3"
                      style={{ fontSize: 16 }}
                    />
                  </View>
                )}

                {/* URL */}
                <View>
                  <Text className="text-muted-foreground mb-1 text-sm">URL</Text>
                  <TextInput
                    testID="workstation-url-input"
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://io43e7u.t.arc0.ai"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    editable={!isSaving && !isDeleting && !isTesting}
                    className="bg-background border-border text-foreground rounded-lg border px-4 py-3"
                    style={{ fontSize: 16 }}
                  />
                  {isHttpUrl(url.trim()) && (
                    <View className="mt-2 flex-row items-center gap-2">
                      <Icon as={AlertTriangleIcon} className="text-yellow-600" size={14} />
                      <Text className="text-yellow-600 text-xs">
                        Consider using HTTPS for better security
                      </Text>
                    </View>
                  )}
                </View>

                {/* Secret */}
                <View>
                  <Text className="text-muted-foreground mb-1 text-sm">
                    Secret {isEditing && '(leave blank to keep current)'}
                  </Text>
                  <View className="flex-row items-center">
                    <TextInput
                      testID="workstation-secret-input"
                      value={isLoadingSecret ? 'Loading...' : secret}
                      onChangeText={setSecret}
                      placeholder={isEditing ? '' : 'Enter shared secret'}
                      placeholderTextColor={colors.mutedForeground}
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={!showSecret}
                      editable={!isSaving && !isDeleting && !isLoadingSecret && !isTesting}
                      className="bg-background border-border text-foreground flex-1 rounded-lg border px-4 py-3"
                      style={{ fontSize: 16 }}
                    />
                    <Pressable
                      onPress={() => setShowSecret(!showSecret)}
                      disabled={isLoadingSecret}
                      hitSlop={8}
                      className="ml-2 p-2 active:opacity-70">
                      <Icon
                        as={showSecret ? EyeOffIcon : EyeIcon}
                        className="text-muted-foreground size-5"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Encryption Key */}
                <View>
                  <Text className="text-muted-foreground mb-1 text-sm">
                    Encryption Key {isEditing && '(clear to remove)'}
                  </Text>
                  <View className="flex-row items-center">
                    <TextInput
                      value={isLoadingEncryptionKey ? 'Loading...' : encryptionKey}
                      onChangeText={setEncryptionKey}
                      placeholder={isEditing ? '' : 'Enter encryption key (optional)'}
                      placeholderTextColor={colors.mutedForeground}
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={!showEncryptionKey}
                      editable={!isSaving && !isDeleting && !isLoadingEncryptionKey && !isTesting}
                      className="bg-background border-border text-foreground flex-1 rounded-lg border px-4 py-3"
                      style={{ fontSize: 16 }}
                    />
                    <Pressable
                      onPress={() => setShowEncryptionKey(!showEncryptionKey)}
                      disabled={isLoadingEncryptionKey}
                      hitSlop={8}
                      className="ml-2 p-2 active:opacity-70">
                      <Icon
                        as={showEncryptionKey ? EyeOffIcon : EyeIcon}
                        className="text-muted-foreground size-5"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Enabled Toggle (only when editing) */}
                {isEditing && (
                  <View className="flex-row items-center justify-between py-2">
                    <Text className="text-foreground">Enabled</Text>
                    <Switch
                      value={enabled}
                      onValueChange={setEnabled}
                      disabled={isSaving || isDeleting}
                      trackColor={{ false: colors.muted, true: colors.primary }}
                    />
                  </View>
                )}

                {/* Error Message */}
                {error && (
                  <View className="bg-destructive/10 rounded-lg px-4 py-3">
                    <Text className="text-destructive text-sm">{error}</Text>
                  </View>
                )}

                {/* Actions */}
                <View className="mt-2 gap-3">
                  {/* Test Connection Button (for new workstations OR when URL changed in edit mode) */}
                  {(!isEditing || urlChanged) && (
                    <Pressable
                      testID="workstation-test-button"
                      onPress={handleTestConnection}
                      disabled={isTesting || !url.trim() || !secret.trim()}
                      className="bg-secondary items-center rounded-lg py-3 active:opacity-70 disabled:opacity-50">
                      {isTesting ? (
                        <View className="flex-row items-center gap-2">
                          <ActivityIndicator size="small" color={colors.foreground} />
                          <Text className="text-secondary-foreground font-medium">Testing...</Text>
                        </View>
                      ) : (
                        <Text className="text-secondary-foreground font-medium">
                          {urlChanged ? 'Verify Connection' : 'Test Connection'}
                        </Text>
                      )}
                    </Pressable>
                  )}

                  {/* Save Button */}
                  <Pressable
                    testID="workstation-save-button"
                    onPress={handleSave}
                    disabled={isSaving || isDeleting || isTesting || !canSave}
                    className="bg-primary items-center rounded-lg py-3 active:opacity-70 disabled:opacity-50">
                    {isSaving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-primary-foreground font-medium">
                        {isEditing ? 'Save Changes' : 'Add Workstation'}
                      </Text>
                    )}
                  </Pressable>

                  {/* Delete Button (only when editing) */}
                  {isEditing && (
                    <Pressable
                      testID="workstation-delete-button"
                      onPress={handleDelete}
                      disabled={isSaving || isDeleting}
                      className="flex-row items-center justify-center gap-2 rounded-lg py-3 active:opacity-70 disabled:opacity-50">
                      {isDeleting ? (
                        <ActivityIndicator size="small" color={colors.destructive} />
                      ) : (
                        <>
                          <Icon as={Trash2Icon} className="text-destructive size-5" />
                          <Text className="text-destructive font-medium">Delete Workstation</Text>
                        </>
                      )}
                    </Pressable>
                  )}

                  {/* Cancel Button */}
                  <Pressable
                    testID="workstation-cancel-button"
                    onPress={handleClose}
                    disabled={isSaving || isDeleting || isTesting}
                    className="items-center rounded-lg py-3 active:opacity-70 disabled:opacity-50">
                    <Text className="text-muted-foreground font-medium">Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
