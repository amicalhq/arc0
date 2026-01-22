import type React from 'react';
import type { SvgProps } from 'react-native-svg';

// Import SVGs as React components
// JavaScript/TypeScript
import ReactIcon from '@/assets/icons/devicons/react.svg';
import TypeScriptIcon from '@/assets/icons/devicons/typescript.svg';
import JavaScriptIcon from '@/assets/icons/devicons/javascript.svg';

// Web Frameworks
import AngularIcon from '@/assets/icons/devicons/angular.svg';
import VueIcon from '@/assets/icons/devicons/vue.svg';
import SvelteIcon from '@/assets/icons/devicons/svelte.svg';
import NextjsIcon from '@/assets/icons/devicons/nextjs.svg';
import NuxtjsIcon from '@/assets/icons/devicons/nuxtjs.svg';
import AstroIcon from '@/assets/icons/devicons/astro.svg';

// Mobile
import FlutterIcon from '@/assets/icons/devicons/flutter.svg';
import DartIcon from '@/assets/icons/devicons/dart.svg';
import AndroidIcon from '@/assets/icons/devicons/android.svg';
import AppleIcon from '@/assets/icons/devicons/apple.svg';

// Styles
import CssIcon from '@/assets/icons/devicons/css.svg';
import SassIcon from '@/assets/icons/devicons/sass.svg';
import TailwindcssIcon from '@/assets/icons/devicons/tailwindcss.svg';

// Backend Languages
import PythonIcon from '@/assets/icons/devicons/python.svg';
import GoIcon from '@/assets/icons/devicons/go.svg';
import RustIcon from '@/assets/icons/devicons/rust.svg';
import RubyIcon from '@/assets/icons/devicons/ruby.svg';
import JavaIcon from '@/assets/icons/devicons/java.svg';
import KotlinIcon from '@/assets/icons/devicons/kotlin.svg';
import SwiftIcon from '@/assets/icons/devicons/swift.svg';
import PhpIcon from '@/assets/icons/devicons/php.svg';
import CsharpIcon from '@/assets/icons/devicons/csharp.svg';
import PerlIcon from '@/assets/icons/devicons/perl.svg';
import LuaIcon from '@/assets/icons/devicons/lua.svg';
import RIcon from '@/assets/icons/devicons/r.svg';
import ScalaIcon from '@/assets/icons/devicons/scala.svg';
import HaskellIcon from '@/assets/icons/devicons/haskell.svg';
import ElixirIcon from '@/assets/icons/devicons/elixir.svg';
import ErlangIcon from '@/assets/icons/devicons/erlang.svg';
import ClojureIcon from '@/assets/icons/devicons/clojure.svg';
import FsharpIcon from '@/assets/icons/devicons/fsharp.svg';
import JuliaIcon from '@/assets/icons/devicons/julia.svg';
import GroovyIcon from '@/assets/icons/devicons/groovy.svg';
import ObjectivecIcon from '@/assets/icons/devicons/objectivec.svg';
import OcamlIcon from '@/assets/icons/devicons/ocaml.svg';
import ZigIcon from '@/assets/icons/devicons/zig.svg';
import NimIcon from '@/assets/icons/devicons/nim.svg';
import ElmIcon from '@/assets/icons/devicons/elm.svg';
import SolidityIcon from '@/assets/icons/devicons/solidity.svg';

// C/C++
import CIcon from '@/assets/icons/devicons/c.svg';
import CppIcon from '@/assets/icons/devicons/cplusplus.svg';

// Web
import HtmlIcon from '@/assets/icons/devicons/html.svg';
import GraphqlIcon from '@/assets/icons/devicons/graphql.svg';
import XmlIcon from '@/assets/icons/devicons/xml.svg';

// Data/Config
import JsonIcon from '@/assets/icons/devicons/json.svg';
import YamlIcon from '@/assets/icons/devicons/yaml.svg';
import MarkdownIcon from '@/assets/icons/devicons/markdown.svg';
import LatexIcon from '@/assets/icons/devicons/latex.svg';
import ProtobufIcon from '@/assets/icons/devicons/protobuf.svg';

// DevOps
import DockerIcon from '@/assets/icons/devicons/docker.svg';
import TerraformIcon from '@/assets/icons/devicons/terraform.svg';
import NginxIcon from '@/assets/icons/devicons/nginx.svg';
import ApacheIcon from '@/assets/icons/devicons/apache.svg';

// Databases
import MysqlIcon from '@/assets/icons/devicons/mysql.svg';
import PostgresqlIcon from '@/assets/icons/devicons/postgresql.svg';
import PrismaIcon from '@/assets/icons/devicons/prisma.svg';

// Build Tools
import GradleIcon from '@/assets/icons/devicons/gradle.svg';
import CmakeIcon from '@/assets/icons/devicons/cmake.svg';
import WebpackIcon from '@/assets/icons/devicons/webpack.svg';
import ViteIcon from '@/assets/icons/devicons/vite.svg';
import NpmIcon from '@/assets/icons/devicons/npm.svg';
import YarnIcon from '@/assets/icons/devicons/yarn.svg';
import PnpmIcon from '@/assets/icons/devicons/pnpm.svg';

// Testing
import JestIcon from '@/assets/icons/devicons/jest.svg';
import PlaywrightIcon from '@/assets/icons/devicons/playwright.svg';
import VitestIcon from '@/assets/icons/devicons/vitest.svg';

// Version Control & Config
import GitIcon from '@/assets/icons/devicons/git.svg';
import EslintIcon from '@/assets/icons/devicons/eslint.svg';

// Shell
import BashIcon from '@/assets/icons/devicons/bash.svg';

// State Management
import ReduxIcon from '@/assets/icons/devicons/redux.svg';

// Data files
import CsvIcon from '@/assets/icons/devicons/csv.svg';
import DatabaseIcon from '@/assets/icons/devicons/database.svg';
import EnvIcon from '@/assets/icons/devicons/env.svg';

// AI Providers
import ClaudeIcon from '@/assets/images/claude_icon.svg';
import GeminiIcon from '@/assets/images/gemini_icon.svg';
import OpenAIIcon from '@/assets/images/openai_icon_light.svg';

export type SvgComponent = React.FC<SvgProps>;

const FILE_TYPE_ICONS: Record<string, SvgComponent> = {
  // React/JavaScript/TypeScript
  tsx: ReactIcon,
  jsx: ReactIcon,
  ts: TypeScriptIcon,
  mts: TypeScriptIcon,
  cts: TypeScriptIcon,
  js: JavaScriptIcon,
  mjs: JavaScriptIcon,
  cjs: JavaScriptIcon,

  // Web Frameworks
  vue: VueIcon,
  svelte: SvelteIcon,
  astro: AstroIcon,

  // Mobile
  dart: DartIcon,

  // Styles
  css: CssIcon,
  scss: SassIcon,
  sass: SassIcon,
  less: CssIcon,

  // Backend Languages
  py: PythonIcon,
  pyw: PythonIcon,
  go: GoIcon,
  rs: RustIcon,
  rb: RubyIcon,
  erb: RubyIcon,
  java: JavaIcon,
  kt: KotlinIcon,
  kts: KotlinIcon,
  swift: SwiftIcon,
  php: PhpIcon,
  cs: CsharpIcon,
  pl: PerlIcon,
  pm: PerlIcon,
  lua: LuaIcon,
  r: RIcon,
  R: RIcon,
  scala: ScalaIcon,
  sc: ScalaIcon,
  hs: HaskellIcon,
  lhs: HaskellIcon,
  ex: ElixirIcon,
  exs: ElixirIcon,
  erl: ErlangIcon,
  hrl: ErlangIcon,
  clj: ClojureIcon,
  cljs: ClojureIcon,
  cljc: ClojureIcon,
  fs: FsharpIcon,
  fsx: FsharpIcon,
  fsi: FsharpIcon,
  jl: JuliaIcon,
  groovy: GroovyIcon,
  gvy: GroovyIcon,
  m: ObjectivecIcon,
  mm: ObjectivecIcon,
  ml: OcamlIcon,
  mli: OcamlIcon,
  zig: ZigIcon,
  nim: NimIcon,
  elm: ElmIcon,
  sol: SolidityIcon,

  // C/C++
  c: CIcon,
  h: CIcon,
  cpp: CppIcon,
  cxx: CppIcon,
  cc: CppIcon,
  hpp: CppIcon,
  hxx: CppIcon,
  hh: CppIcon,

  // Web
  html: HtmlIcon,
  htm: HtmlIcon,
  graphql: GraphqlIcon,
  gql: GraphqlIcon,
  xml: XmlIcon,
  svg: XmlIcon,
  xsl: XmlIcon,
  xslt: XmlIcon,

  // Data/Config
  json: JsonIcon,
  json5: JsonIcon,
  jsonc: JsonIcon,
  yaml: YamlIcon,
  yml: YamlIcon,
  toml: YamlIcon,
  ini: YamlIcon,
  cfg: YamlIcon,
  conf: YamlIcon,
  md: MarkdownIcon,
  mdx: MarkdownIcon,
  tex: LatexIcon,
  latex: LatexIcon,
  bib: LatexIcon,
  proto: ProtobufIcon,

  // Database
  sql: MysqlIcon,
  mysql: MysqlIcon,
  pgsql: PostgresqlIcon,
  prisma: PrismaIcon,
  db: DatabaseIcon,
  sqlite: DatabaseIcon,
  sqlite3: DatabaseIcon,

  // Data files
  csv: CsvIcon,
  tsv: CsvIcon,

  // Environment
  env: EnvIcon,

  // Shell/Scripts
  sh: BashIcon,
  bash: BashIcon,
  zsh: BashIcon,
  fish: BashIcon,
  ps1: BashIcon,
  psm1: BashIcon,
  bat: BashIcon,
  cmd: BashIcon,

  // Config files (by extension)
  gitignore: GitIcon,
  gitattributes: GitIcon,
  gitmodules: GitIcon,
  editorconfig: GitIcon,
  dockerfile: DockerIcon,
  dockerignore: DockerIcon,
  eslintrc: EslintIcon,
  eslintignore: EslintIcon,
};

// Special filename mappings (case-insensitive)
const SPECIAL_FILENAMES: Record<string, SvgComponent> = {
  dockerfile: DockerIcon,
  'docker-compose.yml': DockerIcon,
  'docker-compose.yaml': DockerIcon,
  '.dockerignore': DockerIcon,
  '.gitignore': GitIcon,
  '.gitattributes': GitIcon,
  '.eslintrc': EslintIcon,
  '.eslintrc.js': EslintIcon,
  '.eslintrc.json': EslintIcon,
  '.eslintrc.yml': EslintIcon,
  '.prettierrc': JsonIcon,
  '.prettierrc.js': JavaScriptIcon,
  '.prettierrc.json': JsonIcon,
  'package.json': NpmIcon,
  'package-lock.json': NpmIcon,
  'yarn.lock': YarnIcon,
  'pnpm-lock.yaml': PnpmIcon,
  'tsconfig.json': TypeScriptIcon,
  'jsconfig.json': JavaScriptIcon,
  'vite.config.ts': ViteIcon,
  'vite.config.js': ViteIcon,
  'vitest.config.ts': VitestIcon,
  'vitest.config.js': VitestIcon,
  'webpack.config.js': WebpackIcon,
  'webpack.config.ts': WebpackIcon,
  'next.config.js': NextjsIcon,
  'next.config.mjs': NextjsIcon,
  'next.config.ts': NextjsIcon,
  'nuxt.config.ts': NuxtjsIcon,
  'nuxt.config.js': NuxtjsIcon,
  'astro.config.mjs': AstroIcon,
  'astro.config.ts': AstroIcon,
  'svelte.config.js': SvelteIcon,
  'angular.json': AngularIcon,
  'tailwind.config.js': TailwindcssIcon,
  'tailwind.config.ts': TailwindcssIcon,
  'postcss.config.js': CssIcon,
  'jest.config.js': JestIcon,
  'jest.config.ts': JestIcon,
  'playwright.config.ts': PlaywrightIcon,
  'playwright.config.js': PlaywrightIcon,
  'build.gradle': GradleIcon,
  'build.gradle.kts': GradleIcon,
  'settings.gradle': GradleIcon,
  'settings.gradle.kts': GradleIcon,
  cmakelists: CmakeIcon,
  'CMakeLists.txt': CmakeIcon,
  makefile: BashIcon,
  Makefile: BashIcon,
  'requirements.txt': PythonIcon,
  'setup.py': PythonIcon,
  'pyproject.toml': PythonIcon,
  'Cargo.toml': RustIcon,
  'Cargo.lock': RustIcon,
  'go.mod': GoIcon,
  'go.sum': GoIcon,
  Gemfile: RubyIcon,
  'Gemfile.lock': RubyIcon,
  'pubspec.yaml': FlutterIcon,
  'pubspec.lock': FlutterIcon,
  'composer.json': PhpIcon,
  'composer.lock': PhpIcon,
  '.terraform.lock.hcl': TerraformIcon,
  'main.tf': TerraformIcon,
  'variables.tf': TerraformIcon,
  'outputs.tf': TerraformIcon,
  'nginx.conf': NginxIcon,
  'httpd.conf': ApacheIcon,
  '.htaccess': ApacheIcon,
  'schema.prisma': PrismaIcon,
  redux: ReduxIcon,
  'store.ts': ReduxIcon,
  'store.js': ReduxIcon,
  'Info.plist': AppleIcon,
  'AndroidManifest.xml': AndroidIcon,

  // Environment files
  '.env': EnvIcon,
  '.env.local': EnvIcon,
  '.env.development': EnvIcon,
  '.env.production': EnvIcon,
  '.env.test': EnvIcon,
  '.env.example': EnvIcon,

  // AI/LLM Configuration Files
  'CLAUDE.md': ClaudeIcon,
  'claude.md': ClaudeIcon,
  '.claude': ClaudeIcon,
  'GEMINI.md': GeminiIcon,
  'gemini.md': GeminiIcon,
  '.gemini': GeminiIcon,
  'OPENAI.md': OpenAIIcon,
  'openai.md': OpenAIIcon,
  '.openai': OpenAIIcon,
  'CODEX.md': OpenAIIcon,
  'codex.md': OpenAIIcon,
  '.cursorrules': ClaudeIcon,
  'cursor.rules': ClaudeIcon,
  '.aider': ClaudeIcon,
  'aider.conf': ClaudeIcon,

  // More config files
  '.pnpmfile.cjs': PnpmIcon,
  'pnpm-workspace.yaml': PnpmIcon,
  '.nvmrc': JavaScriptIcon,
  '.node-version': JavaScriptIcon,
  '.ruby-version': RubyIcon,
  '.python-version': PythonIcon,
  'global.css': CssIcon,
  'styles.css': CssIcon,
};

export function getFileTypeIcon(path: string): SvgComponent | null {
  const fileName = path.split('/').pop() || '';
  const lowerFileName = fileName.toLowerCase();

  // Check special filenames first (exact match)
  if (SPECIAL_FILENAMES[fileName]) {
    return SPECIAL_FILENAMES[fileName];
  }
  if (SPECIAL_FILENAMES[lowerFileName]) {
    return SPECIAL_FILENAMES[lowerFileName];
  }

  // Check for dotfiles (e.g., .gitignore, .env)
  if (fileName.startsWith('.')) {
    const dotfileName = fileName.slice(1).toLowerCase();
    if (FILE_TYPE_ICONS[dotfileName]) {
      return FILE_TYPE_ICONS[dotfileName];
    }
  }

  // Get extension
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return FILE_TYPE_ICONS[ext] || null;
}
