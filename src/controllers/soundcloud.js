class SoundCloudController {
  static async download(req, res) {
    res.json({ success: true, message: 'SoundCloud service' });
  }
  static async getTrackInfo(req, res) {
    res.json({ success: true, track: { title: 'SoundCloud Track' } });
  }
}
export { SoundCloudController };
