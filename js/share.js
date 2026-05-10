/* DAO Essence - Share Buttons Handler */
document.addEventListener('DOMContentLoaded', function() {
  var btns = document.querySelectorAll('.share-btn');
  if (!btns.length) return;
  btns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var p = this.getAttribute('data-platform');
      var u = encodeURIComponent(location.href);
      var t = encodeURIComponent(document.title);
      switch(p) {
        case 'twitter':
          window.open('https://twitter.com/intent/tweet?url=' + u + '&text=' + t, '_blank', 'width=600,height=400');
          break;
        case 'facebook':
          window.open('https://www.facebook.com/sharer/sharer.php?u=' + u, '_blank', 'width=600,height=600');
          break;
        case 'linkedin':
          window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + u, '_blank', 'width=600,height=600');
          break;
        case 'whatsapp':
          window.open('https://wa.me/?text=' + t + '%20' + u, '_blank');
          break;
        case 'wechat':
          var m = document.getElementById('wechat-modal');
          if (m) m.style.display = 'flex';
          break;
        case 'copy':
          var self = this;
          navigator.clipboard.writeText(location.href).then(function() {
            var orig = self.innerHTML;
            self.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19l12-12-1.41-1.41z"/></svg>';
            setTimeout(function() { self.innerHTML = orig; }, 2000);
          });
          break;
      }
    });
  });
});
