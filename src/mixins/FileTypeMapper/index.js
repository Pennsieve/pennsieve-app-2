export default {
  data: function() {
    return {
      typeMapper: {
        Image: 'image',
        MRI: 'mri',
        PDF: 'pdf',
        Slide: 'slide',
        Tabular: 'tabular',
        TimeSeries: 'timeseries',
        Video: 'video',
        Text: 'text'
      },
      whitelist: [
        'c#',
'c++',
'java',
'javascript',
'yaml',
'xml',
'sigmaplot',
'shell',
'bash',
'ansys',
'neuron',
'markdown',
'r',
        'python',
'matlab',
'apache',
'php',
'css',
'json',
'ruby',
'html',
'dockerfile',
'ini',
'scala',
'tex',
'mathematica',
        'stata',
'text',
'code',
'ms powerpoint',
'ms word',
'ms excel'
      ]
    }
  },

  viewerForType: function(type) {
    const retValue = this.typeMapper[type];
    return retValue ? retValue : 'default';
  }
}
