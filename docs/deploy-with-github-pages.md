### Deploy with GitHub Pages

Follow these steps to deploy the generated archive to [GitHub Pages](https://pages.github.com/):

0. **Create a repository**: [Create a new empty GitHub repository](https://github.com/new)
0. **Build the site**: Follow the [instructions to build the web site](https://github.com/tweetback/tweetback#build-the-web-site)
   * Note: unless you use a custom domain, you will need to pass your repo's name as your `--pathprefix` option
0. **Navigate to the `_site` folder**: Open a terminal and `cd` into the `_site` folder (where the generated files are located)
0. **Initialize git**: Run `git init` to initialize the folder as a Git repository
0. **Add your GitHub repository**: Run `git remote add origin https://github.com/USERNAME/REPO.git`
0. **Disable Jekyll**: Tell GitHub Pages not to use Jekyll (required for some setups per [this issue](https://github.com/tweetback/tweetback/issues/96)): `touch .nojekyll`
0. *(Optional)* **Exclude unwanted files**: It may be useful to set up a `.gitignore` file to prevent unwanted files from being stored in the repository. For example, if you're on Mac, to prevent `.DS_Store` from syncing, you could run: `echo ".DS_Store" >> .gitignore`
0. **Stage all files**: Stage all files in the `_site` folder for commit: `git add --all`
0. **Commit the changes**: Run `git commit -am "Add Twitter archive"`
0. **Push to GitHub**:
   * Rename your branch to `main`: `git branch -M main`
   * Push the commit to GitHub: `git push -u origin main`
0. **Configure GitHub Pages**:  
   * On the GitHub website, go to the "Settings" tab of your new repository
   * Under the "Pages" section, enable GitHub Pages by selecting the `main` branch
0. **Access your site**: Your site will be available at `https://USERNAME.github.io/REPO/`
0. *(Optional)* **Use a custom domain**: [Set up a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
