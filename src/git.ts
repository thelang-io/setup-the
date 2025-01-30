import { exec } from '@actions/exec'

export interface GitCloneOptions {
  depth?: number
  directory?: string
  singleBranch?: boolean
}

export class Git {
  public async clone (repository: string, options: GitCloneOptions = {}): Promise<void> {
    const args = ['clone']

    if (options.depth !== undefined) {
      args.push('--depth', options.depth.toString())
    }

    if (options.singleBranch !== undefined) {
      args.push('--single-branch')
    }

    args.push(repository)

    if (options.directory !== undefined) {
      args.push(options.directory)
    }

    await exec('git', args)
  }
}

export const git = new Git()
