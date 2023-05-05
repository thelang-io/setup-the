import { execa } from 'execa'

export function downloadUrl (version: string): string {
  return `https://cdn.thelang.io/cli-core-${platformName()}@${version}`
}

export function extractVersionFromOutput (output: string): string | null {
  const [match] = output.match(/Version ([.\d]+) \([\w ]+\)/g) ?? [null]

  if (match === null) {
    return null
  }

  const [result] = match.match(/[.\d]+/g) ?? [null]
  return result
}

export async function getInstalledVersion (): Promise<string> {
  const { stderr, stdout } = await execa('the', ['-v'])
  let version = null

  if (stderr.length === 0 && stdout.length !== 0) {
    version = extractVersionFromOutput(stdout)
  }

  if (version === null) {
    throw new Error('Unable to get version of The programming language')
  }

  return version
}

export function platformName (): string {
  if (process.platform === 'win32') {
    return 'windows'
  } else if (process.platform === 'darwin') {
    return 'macos'
  } else {
    return 'linux'
  }
}
