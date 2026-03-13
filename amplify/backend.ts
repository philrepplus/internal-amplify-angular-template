import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { Aspects, IAspect } from 'aws-cdk-lib';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { IConstruct } from 'constructs';

const backend = defineBackend({
  auth,
  data,
});

// CDK Aspect to force AWS Control Tower compliance on all Amplify-generated buckets
class EnforcePublicAccessBlockAspect implements IAspect {
  visit(node: IConstruct): void {
    // If the resource being created is an S3 Bucket, forcefully apply the strict policy
    if (node instanceof CfnBucket) {
      node.publicAccessBlockConfiguration = {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      };
    }
  }
}

// Apply this Aspect globally to the root of your Amplify backend stack
Aspects.of(backend.stack).add(new EnforcePublicAccessBlockAspect());