### Comments
#### Python, Django, DRF, Postgres, React, Docker, CI/CD

- An application where you can leave comments.
- All comments entered by the user are stored in a relational database.
- For each comment you can write as many comments as you want (cascading).
- Comments are displayed with the ability to sort by the following fields: User Name, E-mail, and date added (both in descending and reverse order).
- You can save an image, which must be no larger than 320x240 pixels, if you try to upload image of larger size, the picture should be proportionally reduced to the specified size, acceptable file formats: JPG, GIF, PNG.
- You can save a text file, which should not be more than 100 kb, TXT format.
- You can use the following allowed HTML tags in your posts: `<a href=”” title=””> </a> <code> </code> <i> </i> <strong> </strong>`.
- Validation of input data is performed on the server and client side.
- A panel with buttons ([i], [strong], [code], [a]) is made for HTML tags.
- The application is deployed on hosting at: oradchenko.pp.ua

#### How to use?

- fork the repository
- create new project
- `git init`
- `git remote add origin <https://github.com/name/repository.git>`
- `git branch -M main`
- `git pull origin main`
- `pip install poetry`
- `cd backend`
- `poetry install`
- `cd ..`
- rename `.env.example` to `.env`
- `docker-compose up -d`
