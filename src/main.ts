import * as core from '@actions/core'
import * as github from '@actions/github'
import _ from 'lodash'

type IssueInfo = {
  body: string | undefined
  issueNodeId: string
}

async function run() {
  try {
    const token = core.getInput('GITHUB_TOKEN', { required: true })
    // const memberList = core.getInput('MEMBER_LIST', { required: true }) // MEMBER_LIST: "mau,john,sarah" this can be set set as a GITHUB_ENV
    const commentsEnabled = core.getInput('WITH_COMMENTS', { required: true })
    // const onCall = memberList.split(',')[0]
    if (
      github.context.payload.action &&
      !['created', 'opened', 'reopened'].includes(github.context.payload.action)
    ) {
      console.log(`
        The status of the action is no applicable ${github.context.payload.action}
      `)
      return
    }

    const issueInfo = getIssueInfo()
    if (!issueInfo) {
      console.log('Could not get the issue number from context, exiting')
      return
    }

    const { issueNodeId, body } = issueInfo

    if (!body) {
      console.log('Could not get the body of the issue, exiting')
      return
    }

    const client = github.getOctokit(token)
    //client.teams.list
    // userId would be whoever is the person on-call

    await addAssigneesToAssignable(client, 'mau', issueNodeId)

    // if (commentsEnabled === 'true') {
    //   const commentBody = createCommentBody(
    //     username,
    //     userUrl,
    //     commitSha,
    //     commitUrl,
    //     commitDate
    //   )
    //   await createComment(client, issueNodeId, commentBody)
    // }
  } catch (error) {
    console.error("GHA Error:",error)
    // core.error(error)
    // core.setFailed(error.message)
  }
}

function getIssueInfo(): IssueInfo | undefined {
  const issue = github.context.payload.issue
  const comment = github.context.payload.comment
  if (!issue) {
    return
  }

  return {
    body: comment ? comment.body : issue.body,
    issueNodeId: issue.node_id,
  }
}

async function addAssigneesToAssignable(
  client: any,
  userId: string,
  issueNodeId: string
): Promise<void> {
  await client.graphql(
    `mutation Assing($input: AddAssigneesToAssignableInput!) {
    addAssigneesToAssignable(input: $input) {
        assignable {
          ... on Issue {
            number
          }
        }
      }
    }
  `,
    {
      input: {
        assignableId: issueNodeId,
        assigneeIds: [userId],
      },
    }
  )
}

// function createCommentBody(
//   username: string,
//   userUrl: string,
//   commitSHA: string,
//   commitUrl: string,
//   commitDate: string
// ) {
//   return `
// ### Commit information
// | | |
// | --- | --- |
// | **Author** | <a href="${userUrl}">${username}</a> |
// | **Commit** | <a href="${commitUrl}">${commitSHA}</a> |
// | **Commit date** | ${commitDate} |
//   `
// }

// async function createComment(
//   client: github.GitHub,
//   issueNodeId: string,
//   body: string
// ): Promise<void> {
//   await client.graphql(
//     `mutation AddComment($input: AddCommentInput!) {
//     addComment(input:$input) {
//       clientMutationId
//     }
//   }
//   `,
//     {
//       input: {
//         subjectId: issueNodeId,
//         body,
//       },
//     }
//   )
// }

run()
