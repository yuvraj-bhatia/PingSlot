#!/bin/bash
# Launch Cursor with AWS Bedrock credentials
# Set your AWS credentials here or use environment variables
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_REGION="us-east-1"

# Launch Cursor with these environment variables
open -a Cursor
