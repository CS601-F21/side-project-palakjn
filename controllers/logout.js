module.exports = function(app) {
    /**
     * Handles GET request for the route /logout to logout the user from the current session
     */
    app.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/");
    });
}