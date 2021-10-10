exports.home=(req,res)=>{
    res.render("hosphome", { user: req.user });
}
