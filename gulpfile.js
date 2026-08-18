const { src, dest } = require('gulp');

function buildIcons() {
  return src(['nodes/**/*.png', 'credentials/**/*.png'], { base: '.' })
    .pipe(dest('dist'));
}

exports['build:icons'] = buildIcons;
