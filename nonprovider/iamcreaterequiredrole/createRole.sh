 #!/bin/bash
 aws iam create-role --role-name iam-cross-account-role --assume-role-policy-document file://trustrelationship.json
 aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/IAMReadOnlyAccess --role-name iam-cross-account-role
