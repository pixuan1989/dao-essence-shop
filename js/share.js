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
        case 'reddit':
          window.open('https://reddit.com/submit?url=' + u + '&title=' + t, '_blank', 'width=800,height=600');
          break;
        case 'pinterest':
          window.open('https://pinterest.com/pin/create/button/?url=' + u + '&description=' + t, '_blank', 'width=750,height=600');
          break;
        case 'instagram':
          navigator.clipboard.writeText(location.href).then(function() {
            var toast = document.createElement('div');
            toast.textContent = 'Link copied! Paste it in your Instagram post or story.';
            toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;z-index:9999;';
            document.body.appendChild(toast);
            setTimeout(function() { toast.remove(); }, 3000);
          });
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
