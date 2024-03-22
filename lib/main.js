"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput('GITHUB_TOKEN', { required: true });
            // const memberList = core.getInput('MEMBER_LIST', { required: true }) // MEMBER_LIST: "mau,john,sarah" this can be set set as a GITHUB_ENV
            const commentsEnabled = core.getInput('WITH_COMMENTS', { required: true });
            // const onCall = memberList.split(',')[0]
            if (github.context.payload.action &&
                !['created', 'opened', 'reopened'].includes(github.context.payload.action)) {
                console.log(`
        The status of the action is no applicable ${github.context.payload.action}
      `);
                return;
            }
            const issueInfo = getIssueInfo();
            if (!issueInfo) {
                console.log('Could not get the issue number from context, exiting');
                return;
            }
            const { issueNodeId, body } = issueInfo;
            if (!body) {
                console.log('Could not get the body of the issue, exiting');
                return;
            }
            const client = github.getOctokit(token);
            //client.teams.list
            // userId would be whoever is the person on-call
            yield addAssigneesToAssignable(client, 'mau', issueNodeId);
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
        }
        catch (error) {
            console.error("GHA Error:", error);
            // core.error(error)
            // core.setFailed(error.message)
        }
    });
}
function getIssueInfo() {
    const issue = github.context.payload.issue;
    const comment = github.context.payload.comment;
    if (!issue) {
        return;
    }
    return {
        body: comment ? comment.body : issue.body,
        issueNodeId: issue.node_id,
    };
}
function addAssigneesToAssignable(client, userId, issueNodeId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.graphql(`mutation Assing($input: AddAssigneesToAssignableInput!) {
    addAssigneesToAssignable(input: $input) {
        assignable {
          ... on Issue {
            number
          }
        }
      }
    }
  `, {
            input: {
                assignableId: issueNodeId,
                assigneeIds: [userId],
            },
        });
    });
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
run();
