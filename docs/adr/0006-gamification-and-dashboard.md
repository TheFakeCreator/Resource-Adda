# 6. Gamification and Dashboard Hub

Date: 2026-06-14

## Status

Accepted

## Context

Resource Adda relies entirely on community contributions (previous year questions, notes, and interview experiences). However, uploading resources is inherently a frictionless action for users who just want to *consume* information, which can lead to a shortage of contributors. 
Furthermore, the user dashboard was a simple placeholder that did not give users a clear sense of identity or ownership over their uploaded resources.

## Decision

We will implement a **Gamification System** built directly into the personalized User Dashboard.
- **Reputation Levels**: Users earn "XP" (Experience Points) based on how many upvotes their uploaded resources receive from the community.
- **Level Scaling**: Levels are calculated mathematically based on their XP.
- **Personalized Dashboard Hub**: A robust, tabbed user interface allowing students to view their "Reputation", track the status of their uploads (`Pending`, `Approved`, `Rejected`), and quickly access bookmarked Placements and Roadmaps.

## Consequences

### Positive
- **Increased Engagement**: Gamifying contributions directly incentivizes students to upload high-quality notes and experiences to reach higher levels.
- **Better UX**: The dashboard shifts from a blank upload page to a personalized profile, giving users a sense of belonging and tracking for their saved materials.
- **Quality Control**: Tying XP to *upvotes* rather than *uploads* ensures users don't spam the platform with low-quality resources just to level up.

### Negative
- **Database Overhead**: We must ensure that the `upvotes` calculation is optimized (possibly through background aggregation) so that loading the dashboard does not cause massive database queries.
- **Abuse Vectors**: We may need to implement rate-limiting or duplicate-check logic to prevent users from creating fake accounts to upvote their own materials.
