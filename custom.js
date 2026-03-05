// ─── Media Status deviation table ──────────────────────────────────────────
// Fetches from the n8n webhook and injects an HTML table into li#media-diff.
// NOTE: Update WEBHOOK_URL if n8n is not accessible at https://automation.fua.nu
(function mediaDiff() {
  var WEBHOOK_URL   = 'https://automation.fua.nu/webhook/d41a998b-ca19-4ee8-86fd-4cdf6b252391';
  var WEBHOOK_TOKEN = 'oo7v8J2fXrbLqmBEYAA2TZDmuz3tezPj7Vl5e5CiPmk3skdmsm2Madp1P9YyqJEm';
  var TABLE_ID      = 'media-diff-table';

  function icon(v) {
    if (v === null || v === undefined) return '<span class="mdt-na">\u2014</span>';
    return v ? '<span class="mdt-yes">\u2713</span>'
             : '<span class="mdt-no">\u2717</span>';
  }

  function buildTable(data) {
    var deviations = data.deviations || [];
    var cache = data._cache;
    var cacheLine = (cache && cache.hit)
      ? ' \u00b7 cached ' + Math.round(cache.age_ms / 60000) + 'm ago'
      : '';

    var rows = deviations.map(function (d) {
      return '<tr>'
        + '<td class="mdt-title">' + (d.title || '?') + '</td>'
        + '<td class="mdt-year">'  + (d.year  || '')  + '</td>'
        + '<td class="mdt-type">'  + (d.type === 'movie' ? '\uD83C\uDFAC' : '\uD83D\uDCFA') + '</td>'
        + '<td class="mdt-icon">'  + icon(d.radarr)   + '</td>'
        + '<td class="mdt-icon">'  + icon(d.sonarr)   + '</td>'
        + '<td class="mdt-icon">'  + icon(d.plex)     + '</td>'
        + '<td class="mdt-icon">'  + icon(d.jellyfin) + '</td>'
        + '</tr>';
    }).join('');

    return '<div id="' + TABLE_ID + '">'
      + '<p class="mdt-meta">' + deviations.length + ' deviations' + cacheLine + '</p>'
      + '<table class="mdt"><thead><tr>'
      + '<th class="mdt-title">Title</th>'
      + '<th class="mdt-year">Year</th>'
      + '<th></th>'
      + '<th>Radarr</th><th>Sonarr</th><th>Plex</th><th>Jellyfin</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table>'
      + '</div>';
  }

  function inject(li, data) {
    var old = document.getElementById(TABLE_ID);
    if (old) old.parentNode.removeChild(old);
    li.insertAdjacentHTML('beforeend', buildTable(data));
  }

  function tryInject() {
    var li = document.getElementById('media-diff');
    if (!li || li._mediaDiffLoaded) return;
    li._mediaDiffLoaded = true;
    fetch(WEBHOOK_URL, { headers: { 'x-token': WEBHOOK_TOKEN } })
      .then(function (r) { return r.json(); })
      .then(function (d) { inject(li, d); })
      .catch(function (e) { console.error('[media-diff]', e); });
  }

  new MutationObserver(tryInject).observe(document.body, { childList: true, subtree: true });
  tryInject();
})();
