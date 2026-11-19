# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |
| < 1.0   | No        |

## Reporting a vulnerability

Do not open a public issue. Report privately through GitHub's private
vulnerability reporting:

https://github.com/himanishpuri/livevitals/security/advisories/new

Include the affected route or service, the steps to reproduce, and the impact
you expect. If the issue involves credentials, do not paste the secret itself.

## What to expect

- Acknowledgement within 3 working days.
- An assessment and a fix plan within 10 working days for confirmed issues.
- A fix released as a patch version, with credit in the advisory if you want it.

## Secrets

The repository contains no secrets. Runtime configuration and credentials live
in untracked `.env*` files (`.env.example` lists only public values). If you
find a secret committed by mistake, report it privately as above; do not quote
it in the report.
