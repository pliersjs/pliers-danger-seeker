module.exports = {
  // All errors will halt the task and exit with a 0
  error: [
    {
      terms: [
        /(^|\s)link.*(href)=(?!versionPath)['"](\w|\.+)/,
        // Too many false positives - /(^|\s)meta.*(content)=(?!versionPath)['"](\w|\.+)/,
        /(src)=(?!versionPath)['"](?!(http|\/\/|\s|'))/
      ],
      fileset: 'templates',
      description: 'Missing versionPath'
    },
    {
      terms: [
        /url\(['"]?(?!(http|\/\/))/
      ],
      fileset: 'css',
      description: 'Missing versionPath'
    }
  ],
  warning: [
    {
      terms: [
        /console\./
      ],
      fileset: ['browserJs', 'serverJs'],
      description: 'console is not support in IE'
    }
  ]
}