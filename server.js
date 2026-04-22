// ...existing code...
app.get('/admin/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.json({ user: { name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// ...existing code...

