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
      fileTypes: [
        {
          value: 'PDF',
          label: 'PDF (.pdf)'
        },
        {
          value: 'MEF',
          label: 'MEF (.mef)'
        },
        {
          value: 'EDF',
          label: 'EDF (.edf)'
        },
        {
          value: 'TDMS',
          label: 'TDMS (.tdms)'
        },
        {
          value: 'Persyst',
          label: 'Persyst (.lay)'
        },
        {
          value: 'DICOM',
          label: 'DICOM (.dicom)'
        },
        {
          value: 'NIFTI',
          label: 'Viewer (.nifti)'
        },
        {
          value: 'PNG',
          label: 'PNG (.png)'
        },
        {
          value: 'CZI',
          label: 'CZI (.czi)'
        },
        {
          value: 'Aperio',
          label: 'Aperio (.aperio)'
        },
        {
          value: 'Json',
          label: 'Json (.json)'
        },
        {
          value: 'CSV',
          label: 'CSV (.csv)'
        },
        {
          value: 'TSV',
          label: 'TSV (.tsv)'
        },
        {
          value: 'Text',
          label: 'Text (.txt)'
        },
        {
          value: 'XML',
          label: 'XML (.xml)'
        },
        {
          value: 'HTML',
          label: 'HTML (.html)'
        },
        {
          value: 'MSExcel',
          label: 'MSExcel (.xls / .xlsx)'
        },
        {
          value: 'MSWord',
          label: 'MSWord (.doc / .docx)'
        },
        {
          value: 'MP4',
          label: 'MP4 (.mp4)'
        },
        {
          value: 'WEBM',
          label: 'WEBM ('
        },
        {
          value: 'OGG',
          label: 'OGG'
        },
        {
          value: 'MOV',
          label: 'MOV'
        },
        {
          value: 'JPEG',
          label: 'JPEG'
        },
        {
          value: 'JPEG2000',
          label: 'JPEG2000'
        },
        {
          value: 'LSM',
          label: 'LSM'
        },
        {
          value: 'NDPI',
          label: 'NDPI'
        },
        {
          value: 'OIB',
          label: 'OIB'
        },
        {
          value: 'ROI',
          label: 'ROI'
        },
        {
          value: 'SWC',
          label: 'SWC'
        },
        {
          value: 'CRAM',
          label: 'CRAM'
        },
        {
          value: 'MGH',
          label: 'MGH'
        },
        {
          value: 'AVI',
          label: 'AVI'
        },
        {
          value: 'MATLAB',
          label: 'MATLAB (.mat)'
        },
        {
          value: 'HDF5',
          label: 'HDF5'
        },
        {
          value: 'TIFF',
          label: 'TIFF'
        },
        {
          value: 'OMETIFF',
          label: 'OMETIFF'
        },
        {
          value: 'BRUKERTIFF',
          label: 'BRUKERTIFF'
        },
        {
          value: 'GIF',
          label: 'GIF'
        },
        {
          value: 'ANALYZE',
          label: 'ANALYZE'
        },
        {
          value: 'NeuroExplorer',
          label: 'NeuroExplorer'
        },
        {
          value: 'MINC',
          label: 'MINC'
        },
        {
          value: 'Blackrock',
          label: 'Blackrock'
        },
        {
          value: 'MobergSeries',
          label: 'MobergSeries'
        },
        {
          value: 'GenericData',
          label: 'GenericData'
        },
        {
          value: 'Nicolet',
          label: 'Nicolet'
        },
        {
          value: 'MEF3',
          label: 'MEF3'
        },
        {
          value: 'Feather',
          label: 'Feather'
        },
        {
          value: 'NEV',
          label: 'NEV'
        },
        {
          value: 'Spike2',
          label: 'Spike2'
        },
        {
          value: 'AdobeIllustrator',
          label: 'AdobeIllustrator'
        },
        {
          value: 'AFNI',
          label: 'AFNI'
        },
        {
          value: 'AFNIBRIK',
          label: 'AFNIBRIK'
        },
        {
          value: 'Ansys',
          label: 'Ansys'
        },
        {
          value: 'BAM',
          label: 'BAM'
        },
        {
          value: 'BIODAC',
          label: 'BIODAC'
        },
        {
          value: 'BioPAC',
          label: 'BioPAC'
        },
        {
          value: 'COMSOL',
          label: 'COMSOL'
        },
        {
          value: 'CPlusPlus',
          label: 'C++'
        },
        {
          value: 'CSharp',
          label: 'C#'
        },
        {
          value: 'Docker',
          label: 'Docker'
        },
        {
          value: 'EPS',
          label: 'EPS'
        },
        {
          value: 'FCS',
          label: 'FCS'
        },
        {
          value: 'FASTA',
          label: 'FASTA'
        },
        {
          value: 'FASTQ',
          label: 'FASTQ'
        },
        {
          value: 'FreesurferSurface',
          label: 'FreesurferSurface'
        },
        {
          value: 'FSFast',
          label: 'FSFast'
        },
        {
          value: 'HDF',
          label: 'HDF'
        },
        {
          value: 'Imaris',
          label: 'Imaris'
        },
        {
          value: 'Intan',
          label: 'Intan'
        },
        {
          value: 'IVCurveData',
          label: 'IVCurveData'
        },
        {
          value: 'JAVA',
          label: 'JAVA'
        },
        {
          value: 'Javascript',
          label: 'Javascript'
        },
        {
          value: 'Jupyter',
          label: 'Jupyter'
        },
        {
          value: 'LabChart',
          label: 'LabChart'
        },
        {
          value: 'Leica',
          label: 'Leica'
        },
        {
          value: 'MatlabFigure',
          label: 'MatlabFigure'
        },
        {
          value: 'Markdown',
          label: 'Markdown'
        },
        {
          value: 'Minitab',
          label: 'Minitab'
        },
        {
          value: 'Neuralynx',
          label: 'Neuralynx'
        },
        {
          value: 'NeuroDataWithoutBorders',
          label: 'NWB'
        },
        {
          value: 'Neuron',
          label: 'Neuron'
        },
        {
          value: 'NihonKoden',
          label: 'NihonKoden'
        },
        {
          value: 'Nikon',
          label: 'Nikon'
        },
        {
          value: 'PatchMaster',
          label: 'PatchMaster'
        },
        {
          value: 'PClamp',
          label: 'PClamp'
        },
        {
          value: 'Plexon',
          label: 'Plexon'
        },
        {
          value: 'PowerPoint',
          label: 'PowerPoint'
        },
        {
          value: 'Python',
          label: 'Python'
        },
        {
          value: 'R',
          label: 'R'
        },
        {
          value: 'RData',
          label: 'RData'
        },
        {
          value: 'Shell',
          label: 'Shell'
        },
        {
          value: 'SolidWorks',
          label: 'SolidWorks'
        },
        {
          value: 'VariantData',
          label: 'VariantData'
        },
        {
          value: 'YAML',
          label: 'YAML'
        },
        {
          value: 'ZIP',
          label: 'ZIP'
        },
      ],

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
