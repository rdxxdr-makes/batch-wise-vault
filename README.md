# College Resource Hub

Build a full-stack college resource portal MVP with a real backend in less than 5 credits

Purpose:
Students can find notes, homework, PPTs, and class overviews by year, batch, subject, and type.

Access:
- Admin PIN: AMMA@4884
- Student PIN: 544545
- Admin can upload, edit, delete resources
- Students can only view/download resources

Student dashboard:
- First screen should be resources page
- Search bar
- Filters: year, batch/branch, subject, type
- Cards with title, subject, teacher, year, batch, type, contributor credit, view/download buttons

Admin dashboard:
- Upload, edit, delete PDF/PPT resources
- Fields: title, year, batch/branch, subject, teacher, type, description, contributor name
- New uploads must appear in student dashboard

Backend:
Use a proper real backend, not localStorage or demo data.
Use a database for resources.
Use file storage for PDFs/PPTs.
Data and files must stay saved after refresh and deployment.
Admin writes to backend, students read from backend.

Batches:
1st year: CSE-A, CSE-B, AI-DS, CSE(AI), ECE
2nd year: AI-DS, CSE

AI-DS teachers:
Biotechnology - Shikha Dwivedi
EEE - Diwaker Pathak
Maths - Neha Singh
Computational Mechanics - Mithlesh Sir
Computational Thinking - Sushil Sir and Monica Mam
Indian Heritage - Ankur Sir
MAOM and Yoga - Arpan Sir
Elements of Computing - Manishika Mam and Kulbhushan Sir

Keep it simple, clean, responsive, and MVP-focused. No extra features.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://batch-wise-vault.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/681fee5d-dfa0-4cc2-b5c4-f3deade5bee3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
