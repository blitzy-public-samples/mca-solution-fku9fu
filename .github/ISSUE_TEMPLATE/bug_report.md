---
name: Bug Report
about: Create a standardized bug report for the MCA application processing system
title: "[BUG] "
labels: ["bug", "needs-triage", "security-impact", "performance-impact", "data-impact"]
assignees: ''
---

<!-- 
This bug report template ensures comprehensive documentation of issues for efficient troubleshooting while maintaining SOC 2 Type II compliance.
Please complete all required sections thoroughly to expedite resolution.
-->

## Bug Description
<!-- REQ: System Availability - Supports maintaining 99.9% uptime through structured bug reporting -->
### Title
<!-- Provide a clear and concise bug title -->

### Description
<!-- Provide a clear and detailed description of the bug -->

### Steps to reproduce
1. 
2. 
3. 

### Expected behavior
<!-- Describe what should happen -->

### Actual behavior
<!-- Describe what actually happens -->

### Environment details
<!-- Specify the environment where the bug occurs -->
- Environment (Dev/Staging/Prod):
- Browser/Client Version:
- Operating System:
- Time/Date of occurrence:

### Severity
<!-- Select one -->
- [ ] Critical (System down/Data loss)
- [ ] High (Major functionality broken)
- [ ] Medium (Feature partially broken)
- [ ] Low (Minor issue/Cosmetic)

## System Context
<!-- REQ: Quality Assurance - Facilitates maintaining ≥ 99% accuracy in data extraction -->
### Affected service(s)
<!-- Check all that apply -->
- [ ] API Gateway
- [ ] Core Service
- [ ] Document Service
- [ ] Email Service
- [ ] Notification Service
- [ ] Web UI

### Component(s) involved
<!-- Specify the specific components affected -->

### API endpoint (if applicable)
<!-- Include the full API endpoint path -->

### Database impact (if any)
<!-- Describe any data-related impact -->

### Infrastructure component (if applicable)
<!-- Specify any infrastructure components affected -->

## Technical Details
<!-- REQ: Processing Time - Helps maintain < 5 minutes per application processing time -->
### Error messages/logs
<!-- Include relevant error messages or log snippets -->
```
[Insert error logs here]
```

### Stack trace (if available)
<!-- Include the full stack trace -->
```
[Insert stack trace here]
```

### Request/Response data
<!-- Include relevant API request/response data (remember to mask sensitive information) -->
```json
{
  "request": {},
  "response": {}
}
```

### Browser/Client details
<!-- Include relevant client-side details -->

### Relevant configuration
<!-- Include any relevant configuration settings -->

## Impact Assessment
<!-- Required for SOC 2 Type II compliance -->
### Business impact
<!-- Describe the impact on business operations -->

### Number of affected users/transactions
<!-- Quantify the scope of impact -->

### Performance impact
<!-- Describe any system performance degradation -->
- Processing time impact:
- Resource utilization:
- Response time degradation:

### Data integrity impact
<!-- Describe any data integrity concerns -->
- Data affected:
- Corruption risk:
- Recovery requirements:

### Security implications
<!-- Describe any security concerns -->
- Data exposure risk:
- Authentication impact:
- Compliance impact:

## Additional Context
<!-- Optional additional information -->
### Screenshots/videos
<!-- Attach any relevant visual evidence -->

### Related issues
<!-- Reference any related issues or pull requests -->

### Related feature requests
<!-- Link to any related feature requests -->

### Workaround (if any)
<!-- Describe any temporary workarounds -->

### Additional notes
<!-- Add any other relevant context -->

---
<!-- 
For Security Team Use:
- SOC 2 Type II Impact Assessment Required: [ ] Yes [ ] No
- Data Privacy Impact Assessment Required: [ ] Yes [ ] No
- Security Review Required: [ ] Yes [ ] No
-->