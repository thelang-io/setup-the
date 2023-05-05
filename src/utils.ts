import type { ExecOptions } from '@actions/exec'
import * as exec from '@actions/exec'

export interface CustomExecResult {
  code: number
  stderr: string
  stdout: string
}

export async function customExec (
  cmd: string,
  args?: string[],
  options: ExecOptions = {}
): Promise<CustomExecResult> {
  let resultStdout = ''
  let resultStderr = ''

  options.listeners = {
    stdout: (data: Buffer) => {
      resultStdout += data.toString()
    },
    stderr: (data: Buffer) => {
      resultStderr += data.toString()
    }
  }

  const result = await exec.exec(cmd, args, options)

  return {
    code: result,
    stderr: resultStderr,
    stdout: resultStdout
  }
}

export function downloadUrl (version: string): string {
  return `https://cdn.thelang.io/cli-core-${platformName()}@${version}`
}

export async function getInstalledVersion (): Promise<string> {
  const { stderr, stdout } = await customExec('the -v')

  if (stderr.length !== 0 || stdout.length === 0) {
    throw new Error('Unable to get version of The programming language')
  }

  const [match] = stdout.match(/Version ([.\d]+) \([\w ]+\)/g) ?? [null]

  if (match === null) {
    throw new Error('Unable to get version of The programming language')
  }

  const [version] = match.match(/[.\d]+/g) ?? [null]

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
