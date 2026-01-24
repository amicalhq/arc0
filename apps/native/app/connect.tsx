/**
 * Connect route - handles deep links for workstation pairing.
 *
 * This route is accessed via:
 * - arc0://connect?url=<encoded_workstation_url>&code=<pairing_code>
 * - https://arc0.ai/connect?url=...&code=... (via Universal Links)
 *
 * It immediately redirects to /settings with the modal param to open
 * the Add Workstation modal with pre-filled values.
 */

import { useLocalSearchParams, Redirect } from 'expo-router';

export default function ConnectScreen() {
  const params = useLocalSearchParams<{ url?: string; code?: string }>();

  // Validate params
  const url = params.url;
  const code = params.code?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const isValid = url && code && code.length === 8;

  // If valid, redirect to settings with modal param
  if (isValid) {
    return (
      <Redirect
        href={{
          pathname: '/settings',
          params: { modal: 'add-workstation', url, code },
        }}
      />
    );
  }

  // If invalid params, redirect to settings without modal
  return <Redirect href="/settings" />;
}
