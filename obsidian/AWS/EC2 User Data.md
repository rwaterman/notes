---
tags: [aws, ec2, snippet]
---

# EC2 User Data

A script passed to an instance at launch and executed by **cloud-init** on **first boot, as root**. Used for bootstrapping — install packages, fetch config, register with a fleet.

- Runs **once** by default (first boot only). Re-run on every boot with a `cloud-init` directive or `[scripts-user, always]`.
- Size limit **16 KB** (before base64 encoding) — for anything bigger, bootstrap a fetch from S3.
- Output/logs land in `/var/log/cloud-init-output.log` — first place to look when a launch "did nothing".
- Retrieve at runtime from IMDS: `http://169.254.169.254/latest/user-data` (prefer **IMDSv2**, token-based).

> [!tip] Don't hand-bake AMIs
> For repeatable images use **EC2 Image Builder** or Packer; keep user data for last-mile, environment-specific config.

# EC2 Instance SSH

```sh
ssh -i "x.pem" ec2-user@ip
```

# User Data Script Example

```bash
#!/bin/bash
yum update -y
yum install httpd php php-mysql -y
chkconfig httpd on
service httpd start
echo "<?php phpinfo();?>" > /var/www/html/index.php
cd /var/www/html
wget https://s3.amazonaws.com/acloudguru-production/connect.php
```

```bash
# Inspect / re-fetch user data from inside the instance (IMDSv2)
TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 600")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/user-data
```
