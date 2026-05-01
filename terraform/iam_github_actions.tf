import {
  to = aws_iam_role.github_actions
  id = "GitHubActionsWorkflowRole"
}

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_iam_policy_document" "github_actions_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:ngdimitrov/portfolio-devops-website:ref:refs/heads/develop"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "GitHubActionsWorkflowRole"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume.json
}

resource "aws_iam_role_policy" "github_actions_deployer" {
  name   = "DeployerPolicy"
  role   = aws_iam_role.github_actions.id
  policy = file("${path.module}/iam_user_github_action_deployer.json")
}
