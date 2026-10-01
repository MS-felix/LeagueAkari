export function supportsLanguageManager(platform: NodeJS.Platform = process.platform) {
  return platform === 'win32'
}
