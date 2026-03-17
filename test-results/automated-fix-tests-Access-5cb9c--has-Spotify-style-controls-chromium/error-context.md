# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img [ref=e8]
      - heading "Welcome back" [level=2] [ref=e14]
      - paragraph [ref=e15]: Accessible Education, Unified
    - generic [ref=e16]:
      - generic [ref=e17]:
        - text: Email address
        - textbox "Email address" [ref=e18]:
          - /placeholder: you@university.edu
      - generic [ref=e19]:
        - text: Password
        - generic [ref=e20]:
          - textbox "Password" [ref=e21]:
            - /placeholder: Enter your password
          - button "Show password" [ref=e22] [cursor=pointer]:
            - img
      - button "Sign In" [ref=e23] [cursor=pointer]
    - link "Adjust accessibility before logging in" [ref=e25] [cursor=pointer]:
      - /url: /pre-login-accessibility
    - generic [ref=e26]:
      - paragraph [ref=e27]:
        - strong [ref=e28]: "Test Accounts:"
        - text: All passwords are
        - code [ref=e29]: password123
      - generic [ref=e30]:
        - button "👩‍💼 Admin" [ref=e31] [cursor=pointer]
        - button "👨‍🏫 Teacher" [ref=e32] [cursor=pointer]
        - button "👩‍🎓 Student" [ref=e33] [cursor=pointer]
```