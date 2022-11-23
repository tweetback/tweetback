# Deploy with GitHub pages

Use the following steps to deploy the generated archive to [GitHub pages](https://pages.github.com/):

0. Create a [new empty GitHub repository](https://github.com/new)
0. After creation, navigate to the Settings tab of your new GitHub repository
0. Navigate to the "Pages" page
0. Enable GitHub pages by selecting your `main` branch
0. Follow the [instructions to Build the web site](https://github.com/tweetback/tweetback#build-the-web-site)
0. Using a terminal, navigate into the `_site` folder
0. Run `git init`
0. Add the new repository as the origin: `git remote add origin git@github.com:USERNAME/REPO.git`
0. Add and commit all generates files in that folder to the new git repository with `git commit -am "Add Twitter archive"`
0. Push your commit: `git branch -M main` and `git push -u origin main` 
0. Your web site will now be serving at the URL `https://USERNAME.github.io/REPO/`
0. Optionally, [use a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)