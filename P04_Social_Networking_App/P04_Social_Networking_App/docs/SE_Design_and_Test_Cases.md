# Software Engineering Design & Test Specifications (P04)

## 1. System Actors
1. **Unregistered Visitor (Guest):** Interacts with Registration and Login modules.
2. **Registered Member (User):** Authenticated user managing their profile, posts, friend connections, and messages.
3. **Rule Validation Engine:** Enforces domain invariants and persists state.

## 2. Use Cases
- **UC-01 Register Account:** Visitor inputs Name, Email, Password, and DOB. System verifies unique email & age >= 13.
- **UC-02 Login:** Visitor authenticates with Email and Password.
- **UC-03 Manage Own Profile:** Member views/edits DOB, Address, Phone, Education, Photo, Profession, and Hobbies.
- **UC-04 Add / Manage Friends:** Member searches users, sends friend requests, and accepts/declines incoming requests.
- **UC-05 View Friend's Basic Profile:** Member views another member's profile card; phone number is masked unless friendship is `ACCEPTED`.
- **UC-06 Message Friend:** Member sends direct messages to an `ACCEPTED` friend.

## 3. Data Model Entities
- `Users(user_id, name, email, password, dob, address, phone, education, profession, hobbies, photo)`
- `Friendships(friendship_id, sender_id, receiver_id, status, created_at)`
- `Messages(message_id, sender_id, receiver_id, body, timestamp)`
- `Posts(post_id, author_id, tag, content, likes, timestamp)`

## 4. Test Cases & Enforced Business Rules
| Rule ID | Business Rule | Test Scenario | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **BR-01** | Unique Email Address | Register with `vishal@iiitbh.ac.in` again | Blocked with error message |
| **BR-02** | Password Policy | Register with password `< 6` chars | Blocked by validation |
| **BR-03** | Minimum Age (>= 13) | Set DOB to `2018-01-01` | Blocked with age policy error |
| **BR-04** | No Self-Friending | Attempt to friend own `user_id` | Blocked by system |
| **BR-05** | No Duplicate Requests | Send request twice to same user | Blocked / button shows `Request Sent` |
| **BR-06** | Friendship-Gated Chat | Attempt to chat with non-friend | Blocked until request is accepted |
