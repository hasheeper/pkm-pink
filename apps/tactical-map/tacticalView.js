/**
 * 🛰️ Project Rhodia - Tactical Hive System (Clean UI / SVG Mode)
 * ----------------------------------------------------------------
 * Visual: Modern White Card + SVG-like Graphics
 * Interactions: Drag to pan, Hover to scan
 */
/* --- 🏛️ SVG Icon Assets (ViewBox: 0 0 256 256) --- */
const SURF_Icons = {
    // 城市/铺路
    CITY: new Path2D("M240,208h-8V88a8,8,0,0,0-8-8H160a8,8,0,0,0-8,8v40H104V40a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM168,96h48V208H168Zm-16,48v64H104V144ZM40,48H88V208H40ZM72,72V88a8,8,0,0,1-16,0V72a8,8,0,0,1,16,0Zm0,48v16a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm0,48v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm48,16V168a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Zm64,0V168a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Zm0-48V120a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Z"),
    
    // 水/波浪
    WAVE: new Path2D("M222.16,177.25a8,8,0,0,1-1,11.25c-17.36,14.39-32.86,19.5-47,19.5-18.58,0-34.82-8.82-49.93-17-25.35-13.76-47.24-25.64-79.07.74a8,8,0,1,1-10.22-12.31c40.17-33.28,70.32-16.92,96.93-2.48,25.35,13.75,47.24,25.63,79.07-.74A8,8,0,0,1,222.16,177.25Zm-11.27-57c-31.83,26.38-53.72,14.5-79.07.74-26.61-14.43-56.76-30.79-96.93,2.49a8,8,0,0,0,10.22,12.31c31.83-26.38,53.72-14.5,79.07-.74,15.11,8.19,31.35,17,49.93,17,14.14,0,29.64-5.11,47-19.5a8,8,0,1,0-10.22-12.31ZM45.11,79.8c31.83-26.37,53.72-14.49,79.07-.74,15.11,8.2,31.35,17,49.93,17,14.14,0,29.64-5.12,47-19.5a8,8,0,1,0-10.22-12.31c-31.83,26.38-53.72,14.5-79.07.74C105.21,50.58,75.06,34.22,34.89,67.5A8,8,0,1,0,45.11,79.8Z"),

    // 植物类 (目前你的提供数据中从这里开始全都一样，但以此做好了分类接口)
    PLANT: new Path2D("M247.63,47.89a8,8,0,0,0-7.52-7.52c-51.76-3-93.32,12.74-111.18,42.22-11.8,19.49-11.78,43.16-.16,65.74a71.34,71.34,0,0,0-14.17,27L98.33,159c7.82-16.33,7.52-33.35-1-47.49-13.2-21.79-43.67-33.47-81.5-31.25a8,8,0,0,0-7.52,7.52c-2.23,37.83,9.46,68.3,31.25,81.5A45.82,45.82,0,0,0,63.44,176,54.58,54.58,0,0,0,87,170.33l25,25V224a8,8,0,0,0,16,0V194.51a55.61,55.61,0,0,1,12.27-35,73.91,73.91,0,0,0,33.31,8.4,60.9,60.9,0,0,0,31.83-8.86C234.89,141.21,250.67,99.65,247.63,47.89ZM47.81,155.6C32.47,146.31,23.79,124.32,24,96c28.32-.24,50.31,8.47,59.6,23.81,4.85,8,5.64,17.33,2.46,26.94L61.65,122.34a8,8,0,0,0-11.31,11.31l24.41,24.41C65.14,161.24,55.82,160.45,47.81,155.6Zm149.31-10.22c-13.4,8.11-29.15,8.73-45.15,2l53.69-53.7a8,8,0,0,0-11.31-11.31L140.65,136c-6.76-16-6.15-31.76,2-45.15,13.94-23,47-35.82,89.33-34.83C232.94,98.34,220.14,131.44,197.12,145.38Z"),
    
    TREE: new Path2D("M198.1,62.59a76,76,0,0,0-140.2,0A71.71,71.71,0,0,0,16,127.8C15.9,166,48,199,86.14,200A72.09,72.09,0,0,0,120,192.47V232a8,8,0,0,0,16,0V192.47A72.17,72.17,0,0,0,168,200l1.82,0C208,199,240.11,166,240,127.8A71.71,71.71,0,0,0,198.1,62.59ZM169.45,184a56.08,56.08,0,0,1-33.45-10v-41l43.58-21.78a8,8,0,1,0-7.16-14.32L136,115.06V88a8,8,0,0,0-16,0v51.06L83.58,120.84a8,8,0,1,0-7.16,14.32L120,156.94v17a56,56,0,0,1-33.45,10C56.9,183.23,31.92,157.52,32,127.84A55.77,55.77,0,0,1,67.11,76a8,8,0,0,0,4.53-4.67,60,60,0,0,1,112.72,0A8,8,0,0,0,188.89,76,55.79,55.79,0,0,1,224,127.84C224.08,157.52,199.1,183.23,169.45,184Z"),
    FLOWER: new Path2D("M208,48a87.48,87.48,0,0,0-35.36,7.43c-15.1-25.37-39.92-38-41.06-38.59a8,8,0,0,0-7.16,0c-1.14.58-26,13.22-41.06,38.59A87.48,87.48,0,0,0,48,48a8,8,0,0,0-8,8V96a88.11,88.11,0,0,0,80,87.63v35.43L83.58,200.84a8,8,0,1,0-7.16,14.32l48,24a8,8,0,0,0,7.16,0l48-24a8,8,0,0,0-7.16-14.32L136,219.06V183.63A88.11,88.11,0,0,0,216,96V56A8,8,0,0,0,208,48ZM120,167.56A72.1,72.1,0,0,1,56,96V64.44A72.1,72.1,0,0,1,120,136Zm8-68.2A88.4,88.4,0,0,0,97.36,63.19c9.57-15.79,24-25.9,30.64-30,6.65,4.08,21.08,14.19,30.64,30A88.46,88.46,0,0,0,128,99.36ZM200,96a72.1,72.1,0,0,1-64,71.56V136a72.1,72.1,0,0,1,64-71.56Z"),
    SAND:   new Path2D("M238.25,229A8,8,0,0,1,227,230.25c-.37-.3-38.82-30.25-99-30.25S29.36,230,29,230.26a8,8,0,0,1-10-12.51c1.63-1.3,38.52-30.26,98.29-33.45A119.94,119.94,0,0,1,114,146.37c1.74-21.71,10.92-50.63,43-72.48A64.65,64.65,0,0,0,140.26,72c-19,.62-30.94,11.71-36.5,33.92A8,8,0,0,1,96,112a7.64,7.64,0,0,1-1.94-.24,8,8,0,0,1-5.82-9.7c9.25-36.95,33.11-45.42,51.5-46a81.48,81.48,0,0,1,21.68,2.45c-3.83-6.33-9.43-12.93-17.21-16.25-10-4.24-22.17-2.39-36.31,5.51a8,8,0,0,1-7.8-14c18.74-10.45,35.72-12.54,50.48-6.2,12.49,5.36,20.73,15.78,25.87,25,6.18-9.64,13.88-16.17,22.39-18.94,11.86-3.87,24.64-.72,38,9.37a8,8,0,0,1-9.64,12.76c-8.91-6.73-16.77-9.06-23.35-6.93-7.29,2.35-12.87,10-16.37,16.61A70.46,70.46,0,0,1,208,73.07c14.61,8.35,32,26.05,32,62.94a8,8,0,0,1-16,0c0-23.46-8.07-40-24-49a50.49,50.49,0,0,0-5.75-2.8,55.64,55.64,0,0,1,5.06,33.06,59.41,59.41,0,0,1-8.86,23.41,8,8,0,0,1-13.09-9.2c.74-1.09,16.33-24.38-3.26-49.37-27,15.21-41.89,37.25-44.16,65.59a104.27,104.27,0,0,0,3.83,36.44c62.65,1.81,101.52,32.33,103.2,33.66A8,8,0,0,1,238.25,229ZM24,140a28,28,0,1,1,28,28A28,28,0,0,1,24,140Zm16,0a12,12,0,1,0,12-12A12,12,0,0,0,40,140Z"),
    CACTUS: new Path2D("M216,208H168V184h4a68.07,68.07,0,0,0,68-68,28,28,0,0,0-56,0,12,12,0,0,1-12,12h-4V56a40,40,0,0,0-80,0V88H84A12,12,0,0,1,72,76a28,28,0,0,0-56,0,68.07,68.07,0,0,0,68,68h4v64H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM96,128H84A52.06,52.06,0,0,1,32,76a12,12,0,0,1,24,0,28,28,0,0,0,28,28H96a8,8,0,0,0,8-8V56a24,24,0,0,1,48,0v80a8,8,0,0,0,8,8h12a28,28,0,0,0,28-28,12,12,0,0,1,24,0,52.06,52.06,0,0,1-52,52H160a8,8,0,0,0-8,8v32H104V136A8,8,0,0,0,96,128Z"),
    SLUM:  new Path2D("M18.294,29.822h5.767v5.764H18.294Zm34.585,17.294h5.767v5.763H52.879Zm0,40.355H81.703v5.766H52.879Zm-34.585-23.059h5.767v5.764H18.294Zm11.53,0h5.764v5.764H29.824ZM96.121,52.883H70.176V41.352h2.882a2.882,2.882,0,1,0,0-5.764H47.115V24.058H50a2.885,2.885,0,1,0,0-5.764H29.824V6.764H12.529v11.527l-8.646,0.003A2.883,2.883,0,0,0,1,21.176a2.883,2.883,0,0,0,2.883,2.882h2.88v28.825h-2.88A2.883,2.883,0,0,0,1,55.768a2.879,2.879,0,0,0,2.883,2.879h2.88v34.59h5.765v-34.59h28.823v34.59h5.764V81.707l23.061,0,0,0v0h5.764v-5.764h-5.764l0-17.293h17.297v34.59h5.764v-34.59h2.885a2.879,2.879,0,0,0,2.879-2.879A2.883,2.883,0,0,0,96.121,52.883Zm-77.827-40.355h5.767v5.767H18.294Zm11.53,23.06H26.939a2.882,2.882,0,0,0,0,5.764h2.885V52.883H12.529V24.058h28.823v11.53H35.588v0h-5.764Zm17.291,40.351,0-23.057h0l0,0H35.588V41.352h28.824v34.587h0H47.115Zm28.827-17.057H75.942V64.412h5.764Z"),
    WASTE: new Path2D("M20,28H17V23.49l8.45-6.57,3.79-1A1,1,0,0,0,28.76,14L26,14.72V12a1,1,0,0,0-2,0v3.51L17,21V13.51l6.43-4.59,3.81-1A1,1,0,1,0,26.76,6L24,6.72V3a1,1,0,0,0-2,0V7.49l-5,3.57V10a1,1,0,0,0-.4-.8L12.17,5.88l1.64-2.3a1,1,0,1,0-1.62-1.16L10.57,4.68,8.6,3.2A1,1,0,1,0,7.4,4.8L15,10.5V19L8,13.51V9A1,1,0,0,0,6,9v4H3a1,1,0,0,0,0,2H6.66L15,21.49V28H3a1,1,0,0,0,0,2H20a1,1,0,0,0,0-2Z M29,28H24a1,1,0,0,0,0,2h5a1,1,0,0,0,0-2Z"),
    MAGMA: new Path2D("M92,89v3c-43.233,0-41.652,0-84,0v-3h.029c0-.771.27-1.53.83-2.102C20.1,75.447,25.663,63.245,31.553,50.328l.718-1.575C32.759,47.686,33.825,47,35,47h11.996L40.618,63.647c-1.088,3,1.025,5.163,3.382,4.995l4.9-.35-3.322,11.138c-.534,1.784,1.999,2.797,2.845,1.138l7.363-14.455c.916-1.817-.319-3.939-2.305-4.08-.7-.05-3.475-.248-4.068-.29L56.147,47H65c1.175,0,2.241.686,2.729,1.753l.718,1.575c5.89,12.917,11.454,25.119,22.695,36.57.56.572.829,1.331.83,2.102Zm-45-78c0-1.657,1.343-3,3-3s3,1.343,3,3-1.343,3-3,3S47,12.657,47,11ZM20,14c0-1.657,1.343-3,3-3s3,1.343,3,3-1.343,3-3,3S20,15.657,20,14ZM8,26c0-1.657,1.343-3,3-3s3,1.343,3,3-1.343,3-3,3S8,27.657,8,26Zm39-3v-3c0-1.657,1.343-3,3-3s3,1.343,3,3v3c0,1.657-1.343,3-3,3S47,24.657,47,23ZM20,26c0-1.657,1.343-3,3-3,5.738,0,13.485,2.42,17.81,13.947.582,1.551-.205,3.28-1.756,3.863-1.58.587-3.287-.225-3.863-1.756C29.618,32.195,25.745,29,20,29,18.343,29,17,27.657,17,26Zm12.149-9.935c.519-1.573,2.208-2.436,3.785-1.916C39.935,16.445,47,23.782,47,35c0,1.657-1.343,3-3,3s-3-1.343-3-3c0-8.215-4.989-13.528-9.935-15.149C29.491,19.335,28.634,17.64,29.149,16.065ZM74,14c0-1.657,1.343-3,3-3s3,1.343,3,3-1.343,3-3,3S74,15.657,74,14Zm12,12c0-1.657,1.343-3,3-3s3,1.343,3,3-1.343,3-3,3S86,27.657,86,26Zm-6-3c1.657,0,3,1.343,3,3s-1.343,3-3,3c-5.745,0-9.618,3.195-12.19,10.053-.576,1.532-2.283,2.343-3.863,1.756-1.551-.583-2.338-2.312-1.756-3.863C66.515,25.42,74.262,23,80,23Zm-27,12c0-11.218,7.065-18.555,14.065-20.851,1.578-.526,3.27.341,3.785,1.916s-.341,3.27-1.916,3.785C63.989,21.472,59,26.785,59,35c0,1.657-1.343,3-3,3S53,36.657,53,35Z"),
    MTN:   new Path2D("M5,12H9V10H5a1.0018,1.0018,0,1,1,.0176-2.0034A.9993.9993,0,0,0,6.1123,6.65a1.883,1.883,0,0,1-.1074-.7974A1.9984,1.9984,0,0,1,9.9443,5.54a1.0006,1.0006,0,0,0,1.5361.6089,1.0386,1.0386,0,0,1,.6914.2681A1.2116,1.2116,0,0,1,13,7.1357V8h2V7.1357a3.2046,3.2046,0,0,0-1.0039-2.3213,2.91,2.91,0,0,0-2.1816-.8091,3.0914,3.0914,0,0,0-.3242.0371,4.0482,4.0482,0,0,0-4.4131-1.939A3.9759,3.9759,0,0,0,4.0088,5.7271a4.2021,4.2021,0,0,0-.0049.4429A3,3,0,0,0,5,12Z M28.93,28,28,15.92a1.0091,1.0091,0,0,0-.8-.9l-.35-.07L24.99,2.85a1.0055,1.0055,0,0,0-1.19-.83l-5,1a.9792.9792,0,0,0-.72.59l-2.76,6.44-3-1a1.0048,1.0048,0,0,0-1.25.58L8,17h4v1L5.84,19.01a1.017,1.017,0,0,0-.82.77L3.2,28H2v2H30V28H28.93Zm-6.14,0L18.97,11.77a.9868.9868,0,0,0-.65-.72l-1.1-.36,2.49-5.81,3.46-.69,1.59,10.34-2.56-.51-.4,1.96,4.26.85L26.92,28H22.79Z"),
    CURSED:new Path2D("M85.21,105.368l20.787,10.721,18.345-15.694Zm-2.99351-3.65246,45.782-5.819L128,95.88281V66.15131L102.16217,65.384Zm17.648-40.34261,25.29.751L96.845,11.275,85.386,44.463ZM45.423,66.986,39.896,96.964l37.584,5.066L98.532,63.684,82.701,47.439Zm-44.69546-.30827,35.46027,28.34021,5.39087-29.23969L30.46985,28.61438.63916,66.54c-.014.01794-.02228.03918-.03589.05737C.64423,66.62543.68817,66.64624.72754,66.67773ZM28.221,118.999l72.501-1.13-22.757-11.737L38.616,100.828Zm6.7414-19.83982L.52277,71.63477l5.58368,31.8584a3.0178,3.0178,0,0,0,1.26318,1.96289l17.24921,11.78485ZM33.93115,26.22754,44.8537,62.76831,81.46136,43.57257,93.3877,9.03186a2.95468,2.95468,0,0,0-.418.08142l-59.208,16.71729A1.99654,1.99654,0,0,1,33.93115,26.22754Z"),
    ELEC:   new Path2D("M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17ZM109.37,214l10.47-52.38a8,8,0,0,0-5-9.06L62,132.71l84.62-90.66L136.16,94.43a8,8,0,0,0,5,9.06l52.8,19.8Z"),
    SNOW:   new Path2D("M223.77,150.09a8,8,0,0,1-5.86,9.68l-24.64,6,6.46,24.11a8,8,0,0,1-5.66,9.8A8.25,8.25,0,0,1,192,200a8,8,0,0,1-7.72-5.93l-7.72-28.8L136,141.86v46.83l21.66,21.65a8,8,0,0,1-11.32,11.32L128,203.31l-18.34,18.35a8,8,0,0,1-11.32-11.32L120,188.69V141.86L79.45,165.27l-7.72,28.8A8,8,0,0,1,64,200a8.25,8.25,0,0,1-2.08-.27,8,8,0,0,1-5.66-9.8l6.46-24.11-24.64-6a8,8,0,0,1,3.82-15.54l29.45,7.23L112,128,71.36,104.54l-29.45,7.23A7.85,7.85,0,0,1,40,112a8,8,0,0,1-1.91-15.77l24.64-6L56.27,66.07a8,8,0,0,1,15.46-4.14l7.72,28.8L120,114.14V67.31L98.34,45.66a8,8,0,0,1,11.32-11.32L128,52.69l18.34-18.35a8,8,0,0,1,11.32,11.32L136,67.31v46.83l40.55-23.41,7.72-28.8a8,8,0,0,1,15.46,4.14l-6.46,24.11,24.64,6A8,8,0,0,1,216,112a7.85,7.85,0,0,1-1.91-.23l-29.45-7.23L144,128l40.64,23.46,29.45-7.23A8,8,0,0,1,223.77,150.09Z"),
    FACTORY:new Path2D("M116,176a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h28A8,8,0,0,1,116,176Zm60-8H148a8,8,0,0,0,0,16h28a8,8,0,0,0,0-16Zm64,48a8,8,0,0,1-8,8H24a8,8,0,0,1,0-16h8V88a8,8,0,0,1,12.8-6.4L96,120V88a8,8,0,0,1,12.8-6.4l38.74,29.05L159.1,29.74A16.08,16.08,0,0,1,174.94,16h18.12A16.08,16.08,0,0,1,208.9,29.74l15,105.13s.08.78.08,1.13v72h8A8,8,0,0,1,240,216Zm-77.86-94.4,8.53,6.4h36.11L193.06,32H174.94ZM48,208H208V144H168a8,8,0,0,1-4.8-1.6l-14.4-10.8,0,0L112,104v32a8,8,0,0,1-12.8,6.4L48,104Z"),
    CABIN: new Path2D("M16,208h224a8,8,0,0,1,0,16H16a8,8,0,0,1,0-16Zm136,16V152a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v72a8,8,0,0,0,16,0V160h16v64a8,8,0,0,0,16,0ZM32,116.69V216a8,8,0,0,0,16,0V116.69a8,8,0,0,0-16,0Zm176,0V216a8,8,0,0,0,16,0V116.69a8,8,0,0,0-16,0ZM235.06,125.78,136.72,27.43a16,16,0,0,0-22.63,0L15.75,125.78a8,8,0,0,0,11.31,11.31L128,36.15,228.94,137.09a8,8,0,1,0,11.31-11.31Z"),
    CARROT: new Path2D("M232,64H203.31l26.35-26.34a8,8,0,0,0-11.32-11.32L192,52.69V24a8,8,0,0,0-16,0V56.57a64,64,0,0,0-77.2,10.12l0,0,0,0,0,0c-40.1,39.39-70.25,133.08-73.19,142.45a16,16,0,0,0,21.26,21.26c9.37-2.94,103.18-33.13,142.47-73.21A64,64,0,0,0,199.43,80H232a8,8,0,0,0,0-16Zm-54.12,82c-8.94,9.12-21.25,17.8-34.85,25.73l-25.38-25.39a8,8,0,0,0-11.32,11.32l22.09,22.09c-40.87,21.19-86.32,35.42-87,35.63A7.93,7.93,0,0,0,40,216a7.93,7.93,0,0,0,.59-1.41c.29-.93,28-89.58,64-130.67l33.77,33.77a8,8,0,0,0,11.32-11.32L116.18,72.88A48,48,0,0,1,177.88,146Z")
};

const ENTITY_ICONS = {
    CAFE: new Path2D("M4,19h16v-2H4V19z M20,13c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2h-2V5H4v10h14V13z M18,7v4h2l0,0c0,0,0,0,0,0c0,0,0,0,0,0l0,0V7H18z"),
    BAR: new Path2D("M21,5V3H3v2l8,9v5H6v2h12v-2h-5v-5L21,5z M7.43,5L12,9.57L16.57,5H7.43z"),
    SHOP: new Path2D("M20,6h-4c0-2.21-1.79-4-4-4S8,3.79,8,6H4V4h16V6z M12,4c1.1,0,2,0.9,2,2h-4C10,4.9,10.9,4,12,4z M20,8L20,8H4v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8z M12,15c-1.66,0-3-1.34-3-3h2c0,0.55,0.45,1,1,1s1-0.45,1-1h2C15,13.66,13.66,15,12,15z"),
    PLAZA: new Path2D("M14.4,6L13,2H6l1.4,4H14.4z M17,21H7v-2h10V21z M17,17H7v-8h10V17z M15,15H9v-4h6V15z"),
    GAME: new Path2D("M21,6H3C1.9,6,1,6.9,1,8v8c0,1.1,0.9,2,2,2h18c1.1,0,2-0.9,2-2V8C23,6.9,22.1,6,21,6z M6,13.5v-1h2v1H6z M9.5,12h-1v-2h1V12z M12,13.5v-1h2v1H12z M18,12h-2V9h2V12z"),
    REST: new Path2D("M21,10.78V15h2v2h-2v4h-2v-4H5v4H3v-4H1v-2h2v-4.22c0-0.55,0.45-1,1-1V5c0-1.1,0.9-2,2-2h12c1.1,0,2,0.9,2,2v2.78C20.55,9.78,21,10.23,21,10.78z M16,5H8v2.78C8.55,7.78,9,8.23,9,8.78V11h6V8.78c0-0.55,0.45-1,1-1V5z"),
    HEAL: new Path2D("M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M13,17h-2v-4H7v-2h4V7h2v4h4v2h-4V17z"),
    PC: new Path2D("M20,18c1.1,0,2-0.9,2-2V6c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6v10c0,1.1,0.9,2,2,2H0v2h24v-2H20z M4,6h16v10H4V6z"),
    POLICE: new Path2D("M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z M12,11.99h7c-0.53,4.12-3.28,7.79-7,8.94V12H5V6.3l7-3.11V11.99z"),
    WARP: new Path2D("M12,2L4.5,20.29l0.71,0.71L12,18l6.79,3l0.71-0.71L12,2z M12,16c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,16,12,16z"),
    GATE: new Path2D("M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M17,19h-2v-8H9v8H7V5h10V19z")
};

const NPC_BASE_URL = "https://raw.githack.com/hasheeper/pkm33/main/data/avatar/";
const FALLBACK_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGc+PGNpcmNsZSBjeD0iMTIiIGN5PSI4IiByPSI0IiBmaWxsPSIjZmZmZmZmIi8+PHBhdGggZD0iTTEyLDE0Yy02LjEsMC04LDQtOCw0djJoMTZ2LTJDMjAsMTgsMTguMSwxNCwxMiwxNHoiIGZpbGw9IiNmZmZmZmYiLz48L2c+PC9zdmc+";

const AVATAR_FIXES = {
    "hex": "hexmaniac",
    "mallows": "mallow",
    "mallow": "mallow"
};

const THREAT_MAP = {
    0: { label: "NULL",  color: "#bdc3c7", alert: false },
    6: { label: "PEACE", color: "#2ecc71", alert: false },
    1: { label: "SAFE",  color: "#2ecc71", alert: false },
    2: { label: "LOW",   color: "#f1c40f", alert: false },
    3: { label: "MID",   color: "#f39c12", alert: true  },
    4: { label: "HIGH",  color: "#e74c3c", alert: true  },
    5: { label: "APEX",  color: "#8e44ad", alert: true  }
};

const TRAV_MAP = {
    0: "OPEN",
    3: "PATH",
    5: "FAST"
};

// --- 🎨 现代可视化配置 ---
const TACTICAL_STYLE = {
    // 巨大化尺寸：便于阅读微型标识
    TILE_SIZE: 180, 
    VIEW_RADIUS: 5,  // 半径缩小，专注于局部细节
    
    // 物理
    DRAG_FRICTION: 0.12,

    // 调色板 (Clean White Theme)
    COLOR_BG:   "#eef2f5", // 屏幕大背景(淡灰)
    CARD_BASE:  "#ffffff", // 卡片白底
    CARD_SHADOW:"rgba(200, 210, 230, 0.4)",
    
    // UI Colors
    ACCENT_PLAYER: "#3498db", // 玩家位置高亮颜色
    TXT_PRIMARY:   "#2c3e50",
    TXT_SECONDARY: "#95a5a6",
};

// 辅助：获取特定层ID (IntGrid)
function getIntVal(gx, gy, lid) {
    if(!window.levelData) return 0;
    const l = window.levelData.layerInstances.find(x => x.__identifier === lid);
    if(!l || !l.intGridCsv) return 0;
    if(gx<0||gy<0||gx>=l.__cWid||gy>=l.__cHei) return 0;
    return l.intGridCsv[gx + gy * l.__cWid] || 0;
}

function getZoneInfo(gx, gy) {
    if(!window.groupCache) return {};

    const findInLayer = (lid) => {
        const layerGroups = window.groupCache[lid];
        if(!layerGroups) return null;
        for(let key in layerGroups) {
            const list = layerGroups[key];
            for(let item of list) {
                const worldX = gx * 16;
                const worldY = gy * 16;
                if(worldX >= item.rect.x && worldX < item.rect.x + item.rect.w &&
                   worldY >= item.rect.y && worldY < item.rect.y + item.rect.h) {
                    return key;
                }
            }
        }
        return null;
    };

    return {
        region: findInLayer("Region_Zone"),
        biome: findInLayer("Biome_Zone")
    };
}

function getIntGridTextName(layerIdentifier, valID) {
    if(!valID || !window.levelData || !window.intGridInfoMap) return null;
    const layer = window.levelData.layerInstances.find(l => l.__identifier === layerIdentifier);
    if(!layer) return null;
    const defMap = window.intGridInfoMap[layer.layerDefUid];
    if(!defMap) return null;
    const entry = defMap[valID];
    if(!entry) return null;
    return entry.id || null;
}

function getEntZoneName(layerIdentifier, gx, gy) {
    if(!window.groupCache || !window.groupCache[layerIdentifier]) return null;
    const worldX = gx * 16;
    const worldY = gy * 16;
    const groups = window.groupCache[layerIdentifier];
    for(const key in groups) {
        for(const item of groups[key]) {
            const r = item.rect;
            if(worldX >= r.x && worldX < r.x + r.w && worldY >= r.y && worldY < r.y + r.h) {
                return key;
            }
        }
    }
    return null;
}

const formatZoneName = (name) => name ? name.replace(/_/g, ' ') : null;
const shortenValue = (text, max = 8) => {
    if(!text) return "---";
    return text.length > max ? `${text.slice(0, max - 2)}..` : text;
};

function parseActorName(rawName) {
    if(!rawName) return { name: "NPC", detail: "" };
    const parts = rawName.split('_');
    const name = (parts[0] || "NPC").toUpperCase();
    const detail = parts.length > 1 ? parts.slice(1).join(' ') : "";
    return { name, detail };
}

/* --- 🔧 Autotile Helpers --- */
function checkPathCon(gx, gy) {
    const val = getIntVal(gx, gy, "Traversability");
    return val > 0;
}

function checkInfraCon(gx, gy, selfID) {
    const neighborID = getIntVal(gx, gy, "Infrastructure");
    return neighborID > 0;
}

/* --- 🛠️ Color Utilities --- */
function hexToRgba(hex, alphaMulti = 1) {
    if (!hex) return `rgba(200,200,200,${0.1 * alphaMulti})`;

    let raw = hex.trim();
    if (raw[0] === "#") raw = raw.slice(1);
    let chars = raw.split("");
    if (chars.length === 3) {
        chars = [chars[0], chars[0], chars[1], chars[1], chars[2], chars[2]];
    }

    const rgbHex = chars.join("").substring(0, 6).padEnd(6, "0");
    const hexVal = parseInt(rgbHex, 16);
    return `rgba(${(hexVal >> 16) & 255}, ${(hexVal >> 8) & 255}, ${hexVal & 255}, ${alphaMulti})`;
}

const TacticalSystem = {
    isActive: false,

    imgCache: {},
    
    anchor: { x:0, y:0 }, // 此时鼠标点击的锚点中心
    playerGrid: { x:0, y:0 }, // 真实的玩家所占格子
    
    cam: { x:0, y:0, inputX:0, inputY:0 },
    isDragging: false,
    lastMouse: { x:0, y:0 },
    
    // 数据面板
    hoverData: null,
    
    ctx: null, w:0, h:0,

    enter: function(ctx, w, h, pGx, pGy) {
        this.isActive = true;
        this.ctx = ctx; this.w = w; this.h = h;
        
        // 记录进入时的中心
        this.anchor = { x: Math.floor(pGx), y: Math.floor(pGy) };
        this.playerGrid = { x: Math.floor(pGx), y: Math.floor(pGy) };
        
        this.cam = { x:0, y:0, inputX:0, inputY:0 };
        this.isDragging = false; 
        
        this.bindEvents();
        this.checkHover(this.w/2, this.h/2);
        this.render();
    },

    exit: function() {
        this.isActive = false;
        this.unbindEvents();
        this.ctx.setTransform(1,0,0,1,0,0);
        if(window.resumeGlobalMap) window.resumeGlobalMap();
    },

    bindEvents: function() {
        this.unbindEvents();
        this._down = e => { 
            if(e.button===0) {
                // 检查是否点击了宝可梦面板标题栏
                if (this.handlePokemonPanelClick(e.clientX, e.clientY)) {
                    return; // 点击了折叠按钮，不开始拖拽
                }
                this.isDragging=true; 
                this.lastMouse={x:e.clientX, y:e.clientY};
            } 
        };
        this._up   = () => this.isDragging=false;
        this._move = e => {
            if(this.isDragging) {
                this.cam.inputX += e.clientX - this.lastMouse.x;
                this.cam.inputY += e.clientY - this.lastMouse.y;

                const dragLimit = TACTICAL_STYLE.TILE_SIZE * 1.2;
                this.cam.inputX = Math.max(-dragLimit, Math.min(dragLimit, this.cam.inputX));
                this.cam.inputY = Math.max(-dragLimit, Math.min(dragLimit, this.cam.inputY));

                this.lastMouse={x:e.clientX, y:e.clientY};
            }
            this.checkHover(e.clientX, e.clientY);
        };

        window.addEventListener('mousedown', this._down);
        window.addEventListener('mouseup', this._up);
        window.addEventListener('mousemove', this._move);
    },
    unbindEvents: function() {
        if(this._down) window.removeEventListener('mousedown', this._down);
        if(this._up) window.removeEventListener('mouseup', this._up);
        if(this._move) window.removeEventListener('mousemove', this._move);
    },

    checkHover: function(mx, my) {
        const cx = this.w/2 + this.cam.x; const cy = this.h/2 + this.cam.y;
        const s = TACTICAL_STYLE.TILE_SIZE;
        const dx = Math.floor((mx - cx + s/2)/s);
        const dy = Math.floor((my - cy + s/2)/s);
        const gx = this.anchor.x + dx; 
        const gy = this.anchor.y + dy;

        const tags = getZoneInfo(gx, gy);
        const surfaceVal = getIntVal(gx, gy, "Surface") || 0;
        const threatVal = getIntVal(gx, gy, "Threat") || 0;
        const infraVal = getIntVal(gx, gy, "Infrastructure") || 0;
        const travVal = getIntVal(gx, gy, "Traversability") || 0;
        const obsVal = getIntVal(gx, gy, "Obstacles") || 0;
        const underVal = getIntVal(gx, gy, "Underground_Access") || 0;
        const regionIntVal = getIntVal(gx, gy, "Regions") || 0;

        const threatInfo = THREAT_MAP[threatVal] || THREAT_MAP[0];

        const regionEntity = formatZoneName(tags.region);
        const regionIntName = formatZoneName(getIntGridTextName("Regions", regionIntVal));
        const regionDisplay = regionEntity || regionIntName || (regionIntVal ? `SEC-${regionIntVal}` : "UNDEFINED");
        const biomeDisplay = formatZoneName(tags.biome) || "---";

        const surfaceName = (window.TERRAIN_CONFIG && window.TERRAIN_CONFIG[surfaceVal]?.type) || "VOID";
        const infraLabel = infraVal > 0 ? "YES" : "NO";
        const travLabel = TRAV_MAP[travVal] || "CLOSED";
        const obsLabel = obsVal === 1 ? "BLOCK" : "OPEN";
        const tunnelLabel = underVal > 0 ? "FOUND" : "NONE";

        this.hoverData = {
            gx,
            gy,
            surface: surfaceVal,
            threat: threatVal,
            infra: infraVal,
            trav: travVal,
            obs: obsVal,
            under: underVal,
            regionInt: regionIntVal,
            regionName: regionDisplay,
            biomeName: biomeDisplay,
            surfaceName,
            // 原始值用于宝可梦生成
            biomeZoneRaw: tags.biome || '',
            surfaceTypeRaw: surfaceName,
            infraText: infraLabel,
            travText: travLabel,
            obsText: obsLabel,
            tunnelText: tunnelLabel,
            threatLabel: threatInfo.label,
            threatColor: threatInfo.color,
            threatAlert: threatInfo.alert
        };
    },

    // --- MAIN RENDER ---
    render: function() {
        if(!this.isActive) return;
        const ctx = this.ctx;
        const { w, h } = this;

        // 背景清空
        ctx.fillStyle = TACTICAL_STYLE.COLOR_BG;
        ctx.fillRect(0,0, w, h);

        // 物理缓动相机
        this.cam.x += (this.cam.inputX - this.cam.x) * TACTICAL_STYLE.DRAG_FRICTION;
        this.cam.y += (this.cam.inputY - this.cam.y) * TACTICAL_STYLE.DRAG_FRICTION;

        // View Setup
        ctx.save();
        ctx.translate(w/2 + this.cam.x, h/2 + this.cam.y);

        const R = Math.min(3, TACTICAL_STYLE.VIEW_RADIUS);
        const S = TACTICAL_STYLE.TILE_SIZE;

        // --- Layer 1: 底板卡片 (White Cards) --- 
        for(let dy=-R; dy<=R; dy++) {
            for(let dx=-R; dx<=R; dx++) {
                const gx = this.anchor.x + dx; 
                const gy = this.anchor.y + dy;
                
                // Dist fading
                const d = Math.sqrt(dx*dx + dy*dy);
                if(d > R+0.5) continue;
                const alpha = Math.max(0.2, 1 - (d / (R + 0.5)));
                
                // 绘制这个格子
                this.drawTile(ctx, dx*S, dy*S, S, gx, gy, alpha);
            }
        }

        // --- Layer 2: 实体/标志 (Entity Overlay) ---
        this.drawEntityLayer(ctx, R, S);
        this.drawHoverFrame(ctx, S);

        ctx.restore();

        if(this.hoverData) this.drawSidePanel(ctx);

        requestAnimationFrame(() => this.render());
    },

    // 🏆 Draw Tile UI (核心: 每一个方块就是一个仪表盘)
    drawTile: function(ctx, x, y, size, gx, gy, alpha = 1) {
        const px = x - size / 2;
        const py = y - size / 2;
        this._drawInfoTile(ctx, gx, gy, px, py, size, alpha);
    },

    drawHoverFrame: function(ctx, size) {
        if(!this.hoverData) return;
        ctx.save();
        const dx = this.hoverData.gx - this.anchor.x;
        const dy = this.hoverData.gy - this.anchor.y;
        ctx.strokeStyle = "rgba(52, 152, 219, 0.85)";
        ctx.lineWidth = 4;
        ctx.strokeRect(dx*size - size/2 + 2, dy*size - size/2 + 2, size - 4, size - 4);
        ctx.restore();
    },

    _drawInfoTile: function(ctx, gx, gy, px, py, size, alpha) {
        const gap = 8;
        const realS = size - gap;
        const padding = (size - realS) / 2;
        const x = px + padding;
        const y = py + padding;
        const radius = 10;

        const surfID = getIntVal(gx, gy, "Surface");
        const threatVal = getIntVal(gx, gy, "Threat");
        const infraID = getIntVal(gx, gy, "Infrastructure");
        const travVal = getIntVal(gx, gy, "Traversability");

        const isPlayerPos = (gx === this.playerGrid.x && gy === this.playerGrid.y);
        const isHover = (this.hoverData && this.hoverData.gx === gx && this.hoverData.gy === gy);

        const config = (window.TERRAIN_CONFIG && window.TERRAIN_CONFIG[surfID]) || { el: 0, fill: "#cccccc", type: "VOID" };
        const elev = (config.el === undefined) ? 0 : config.el;
        const isConcave = elev < 2;

        const bgAlphaStart = isConcave ? 0.12 : 0.08;
        const tileBgColor = hexToRgba(config.fill, bgAlphaStart * alpha);

        const prevAlpha = ctx.globalAlpha;
        ctx.globalAlpha = alpha;

        ctx.save();
        if (isConcave) {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        } else {
            const shadowOpacity = 0.3 * alpha;
            const shadowOffset = Math.max(4, elev * 1.5);
            ctx.shadowColor = isPlayerPos 
                ? "rgba(52, 152, 219, 0.6)"
                : `rgba(90, 100, 120, ${shadowOpacity})`;
            ctx.shadowBlur = isPlayerPos ? 30 : 15;
            ctx.shadowOffsetY = isPlayerPos ? 0 : shadowOffset;
        }

        ctx.fillStyle = tileBgColor;
        const renderInset = isConcave ? 1.5 : 0;
        ctx.beginPath();
        ctx.roundRect(x + renderInset, y + renderInset, realS - renderInset * 2, realS - renderInset * 2, radius);
        ctx.fill();

        if (!isConcave) {
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = hexToRgba(config.fill, 0.35 * alpha);
            ctx.beginPath();
            ctx.roundRect(x + renderInset, y + renderInset, realS - renderInset * 2, realS - renderInset * 2, radius);
            ctx.stroke();
        }
        if (isPlayerPos) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = TACTICAL_STYLE.ACCENT_PLAYER;
            ctx.beginPath();
            ctx.roundRect(x + renderInset, y + renderInset, realS - renderInset * 2, realS - renderInset * 2, radius);
            ctx.stroke();
        }
        ctx.restore();

        if (surfID > 0) {
            ctx.save();
            const t = config.type || "";

            let targetIcon = null;
            let iconScale = 1.0;
            let iconOffset = { x: 0, y: 0 };
            let iconBase = 256;
            let customTint = null;

            if (t.includes('Sand') || t === 'Coastal_Sand' || t === 'Desert_Sand') targetIcon = SURF_Icons.SAND;
            else if (t === 'CACTUS') targetIcon = SURF_Icons.CACTUS;
            else if (t.includes('Forest') || t === 'Deep_Jungle') targetIcon = SURF_Icons.TREE;
            else if (t === 'Flower_Field') targetIcon = SURF_Icons.FLOWER;
            else if (t === 'High_Voltage') targetIcon = SURF_Icons.ELEC;
            else if (t === 'Snowfield' || t === 'Withered_Grass') {
                targetIcon = SURF_Icons.SNOW;
                customTint = `rgba(110, 140, 190, ${Math.max(0.35, alpha * 0.6)})`;
            }
            else if (t === 'Swamp') {
                targetIcon = SURF_Icons.PLANT;
            }
            else if (t === 'Magma') {
                targetIcon = SURF_Icons.MAGMA;
                iconScale = 1.4;
                iconOffset = { x: 10, y: 0 };
                iconBase = 125;
            }
            else if (t === 'Rocky_Mountain') {
                targetIcon = SURF_Icons.MTN;
                iconScale = 1.2;
                iconBase = 32;
            }
            else if (t === 'Scorched_Earth') {
                targetIcon = SURF_Icons.CURSED;
                iconScale = 1.2;
                iconBase = 160;
            }
            else if (t === 'Slum_Pavement') {
                targetIcon = SURF_Icons.SLUM;
                iconScale = 2.5;
                iconOffset = { x: 70, y: 100 };
            }
            else if (t === 'Waste') {
                targetIcon = SURF_Icons.WASTE;
                iconBase = 32;
            }
            else if (t === 'Wet_Soil' || t === 'FARM') targetIcon = SURF_Icons.CARROT;
            else if (t === 'Ancient_Timber') targetIcon = SURF_Icons.CABIN;
            else if (t === 'Industrial') targetIcon = SURF_Icons.FACTORY;
            else if (t.includes('Pavement') || t === 'Wall_Block') targetIcon = SURF_Icons.CITY;
            else if (['Water','Sea','Sewage','Glacial'].some(k => t.includes(k))) {
                targetIcon = SURF_Icons.WAVE;
                // 深海使用更深的颜色
                if (t === 'Deep_Sea') {
                    customTint = `rgba(0, 80, 150, ${Math.max(0.4, alpha * 0.6)})`;
                }
            }
            else if (t.includes('Grass') || t === 'Synthetic_Turf') targetIcon = SURF_Icons.PLANT;
            else if (SURF_Icons[t]) targetIcon = SURF_Icons[t];

            if (targetIcon) {
                const baseSize = 80;
                const iconSize = baseSize * iconScale;
                const viewScale = iconSize / iconBase;

                let tintAlpha = isConcave ? 0.25 : 0.4;
                if (elev === 0) tintAlpha = 0.2;
                const drawColor = customTint || hexToRgba(config.fill, alpha * tintAlpha);

                const drawX = x + realS / 2 - iconSize / 2 + iconOffset.x;
                const drawY = y + realS - iconSize - 12 + iconOffset.y;

                ctx.translate(drawX, drawY);
                ctx.scale(viewScale, viewScale);
                ctx.fillStyle = drawColor;
                ctx.fill(targetIcon);
                ctx.restore();
            } else {
                const bH = 6;
                ctx.fillStyle = hexToRgba(config.fill, 0.6 * alpha);
                ctx.fillRect(x + 20, y + realS - 24, realS - 40, bH);
                ctx.restore();
            }
        }

        if (travVal > 0) {
            ctx.save();
            this._drawGridConnections(ctx, gx, gy, px, py, size, (midX, midY) => {
                const strokeW = (travVal === 5) ? 3 : 4;
                const pColor = (travVal === 5)
                    ? "rgba(160, 100, 50, 0.4)"
                    : "rgba(180, 190, 200, 0.5)";
                ctx.strokeStyle = pColor;
                ctx.lineWidth = strokeW;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
            }, "Path");
            ctx.restore();
        }

        this._drawInfrastructure(ctx, gx, gy, px, py, size, infraID, alpha);
        this._drawThreatToken(ctx, x, y, realS, threatVal, alpha);

        if (isHover) {
            ctx.save();
            ctx.strokeStyle = "#3498db";
            ctx.lineWidth = 2;
            ctx.shadowColor = "#3498db";
            ctx.shadowBlur = 5;
            ctx.strokeRect(x, y, realS, realS);
            ctx.restore();
        }

        ctx.globalAlpha = prevAlpha;
    },

    _drawGridConnections: function(ctx, gx, gy, px, py, size, styleFn, type) {
        const midX = px + size / 2;
        const midY = py + size / 2;
        let n = false, s = false, w = false, e = false;

        if (type === "Path") {
            n = checkPathCon(gx, gy - 1); s = checkPathCon(gx, gy + 1);
            w = checkPathCon(gx - 1, gy); e = checkPathCon(gx + 1, gy);
        }

        ctx.beginPath();
        if (n) { ctx.moveTo(midX, midY); ctx.lineTo(midX, py); }
        if (s) { ctx.moveTo(midX, midY); ctx.lineTo(midX, py + size); }
        if (w) { ctx.moveTo(midX, midY); ctx.lineTo(px, midY); }
        if (e) { ctx.moveTo(midX, midY); ctx.lineTo(px + size, midY); }
        if (!n && !s && !w && !e) {
            ctx.moveTo(midX - 2, midY);
            ctx.lineTo(midX + 2, midY);
        }

        styleFn(midX, midY);
        ctx.stroke();
    },

    _drawThreatToken: function(ctx, x, y, realS, val, alpha) {
        const info = THREAT_MAP[val] || THREAT_MAP[0];
        const cx = x + realS - 16;
        const cy = y + 16;
        const pulse = 1 + Math.sin(Date.now() / 300) * 0.2;
        const radius = info.alert && val >= 4 ? 4 * pulse : 4;

        ctx.save();
        ctx.fillStyle = info.color;
        ctx.shadowColor = info.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = alpha * 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    _drawInfrastructure: function(ctx, gx, gy, px, py, size, infraID, alpha) {
        if (!infraID) return;

        const iN = checkInfraCon(gx, gy - 1, infraID);
        const iS = checkInfraCon(gx, gy + 1, infraID);
        const iW = checkInfraCon(gx - 1, gy, infraID);
        const iE = checkInfraCon(gx + 1, gy, infraID);
        const midX = px + size / 2;
        const midY = py + size / 2;

        const pColor = (infraID === 2) ? "#ff4757" : "#ffa502";

        ctx.save();
        ctx.beginPath();
        if (iN) { ctx.moveTo(midX, midY); ctx.lineTo(midX, py); }
        if (iS) { ctx.moveTo(midX, midY); ctx.lineTo(midX, py + size); }
        if (iW) { ctx.moveTo(midX, midY); ctx.lineTo(px, midY); }
        if (iE) { ctx.moveTo(midX, midY); ctx.lineTo(px + size, midY); }
        if (!iN && !iS && !iW && !iE) ctx.arc(midX, midY, 1, 0, Math.PI * 2);

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 4;
        ctx.lineWidth = 14;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.shadowColor = "transparent";
        ctx.shadowOffsetY = 0;
        ctx.lineWidth = 6;
        ctx.strokeStyle = pColor;
        ctx.stroke();

        const junctions = (iN ? 1 : 0) + (iS ? 1 : 0) + (iW ? 1 : 0) + (iE ? 1 : 0);
        if (junctions !== 2 || !((iN && iS) || (iW && iE))) {
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(midX, midY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    },

    drawEntityLayer: function(ctx, range, S) {
        if(!window.levelData) return;

        const VALID_LAYERS = ["NPC_Actor", "Service", "PlayerStart", "Core_Logic", "Place_Anchor"];
        const minGx = this.anchor.x - range, maxGx = this.anchor.x + range;
        const minGy = this.anchor.y - range, maxGy = this.anchor.y + range;

        const gridBuckets = {};

        window.levelData.layerInstances.forEach(layer => {
            if(!VALID_LAYERS.includes(layer.__identifier)) return;

            layer.entityInstances.forEach(ent => {
                const gx = ent.__grid[0], gy = ent.__grid[1];
                if(gx >= minGx && gx <= maxGx && gy >= minGy && gy <= maxGy) {
                    const key = `${gx},${gy}`;
                    if(!gridBuckets[key]) gridBuckets[key] = [];
                    gridBuckets[key].push({ ent, type: layer.__identifier });
                }
            });
        });

        const SPACING = 52;

        Object.keys(gridBuckets).forEach(key => {
            let stackList = gridBuckets[key];
            stackList.sort((a,b) => (a.type === 'NPC_Actor' ? -1 : 0) - (b.type === 'NPC_Actor' ? -1 : 0));
            if(stackList.length > 4) stackList = stackList.slice(0, 4);

            const [gxStr, gyStr] = key.split(',');
            const gx = parseInt(gxStr, 10);
            const gy = parseInt(gyStr, 10);

            const drawX = (gx - this.anchor.x) * S;
            const drawY = (gy - this.anchor.y) * S;
            const driftBase = Math.sin(Date.now() / 600 + gx * gy) * 3;

            const totalContentH = stackList.length * SPACING;
            let currentY = drawY - (S * 0.25) - (totalContentH * 0.5);

            stackList.forEach(item => {
                this._drawGlassBadge(ctx, drawX, currentY + driftBase, item.ent, item.type);
                currentY += SPACING;
            });
        });
    },

    _drawGlassBadge: function(ctx, x, y, ent, layerName) {
        if(layerName === "NPC_Actor") {
            this._drawNPCBadge(ctx, x, y, ent);
        } else {
            this._drawStandardBadge(ctx, x, y, ent, layerName);
        }
    },

    _drawNPCBadge: function(ctx, x, y, ent) {
        let rawName = ent.__identifier;
        if(ent.fieldInstances[0] && ent.fieldInstances[0].__value) {
            rawName = ent.fieldInstances[0].__value;
        }

        const { name, detail } = parseActorName(rawName);

        let drawAvatar = null;
        let imgKey = name.toLowerCase();
        if(AVATAR_FIXES[imgKey]) imgKey = AVATAR_FIXES[imgKey];

        if(this.imgCache[imgKey] && this.imgCache[imgKey].loaded) {
            drawAvatar = this.imgCache[imgKey].img;
        } else if(!this.imgCache[imgKey]) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            this.imgCache[imgKey] = { loaded: false, img };
            img.onload = () => { this.imgCache[imgKey].loaded = true; };
            img.onerror = () => { this.imgCache[imgKey].img.src = FALLBACK_AVATAR; };
            img.src = `${NPC_BASE_URL}${imgKey}.png`;
        }

        const PLATE_H = 34;
        const BOX_RAD = 4;
        const AVATAR_R = 20;
        const TEXT_PAD_L = 36;

        ctx.font = "800 12px 'Inter', sans-serif";
        const w1 = ctx.measureText(name).width;
        ctx.font = "600 8px monospace";
        const w2 = ctx.measureText(detail || "NPC").width;
        const maxTextW = Math.max(w1, w2);
        const PLATE_W = Math.round(TEXT_PAD_L + maxTextW + 14);

        const PIN_HEIGHT = 12;
        const bx = x - (PLATE_W * 0.4);
        const by = y - PIN_HEIGHT - PLATE_H;
        const cx = bx - 6;
        const cy = by + (PLATE_H / 2);

        ctx.save();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + 10, by + PLATE_H);
        ctx.lineTo(x, y - 2);
        ctx.stroke();

        ctx.fillStyle = "#2ecc71";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = "rgba(33, 40, 50, 0.95)";
        ctx.beginPath();
        if(ctx.roundRect) ctx.roundRect(bx, by, PLATE_W, PLATE_H, BOX_RAD);
        else ctx.rect(bx, by, PLATE_W, PLATE_H);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(cx, cy, AVATAR_R, 0, Math.PI * 2);
        ctx.fillStyle = "#2C3E50";
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, AVATAR_R - 2, 0, Math.PI * 2);
        ctx.clip();
        if(drawAvatar) {
            ctx.drawImage(drawAvatar, cx - AVATAR_R, cy - AVATAR_R, AVATAR_R * 2, AVATAR_R * 2);
        } else {
            ctx.fillStyle = "#555";
            ctx.fill();
        }
        ctx.restore();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#F1C40F";
        ctx.beginPath();
        ctx.arc(cx, cy, AVATAR_R - 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 12px 'Inter', sans-serif";
        ctx.fillText(name, bx + TEXT_PAD_L, by + 12);

        ctx.fillStyle = "#95a5a6";
        ctx.font = "600 8px monospace";
        let renderDetail = detail.length > 20 ? `${detail.substr(0, 18)}..` : detail;
        if(!renderDetail) renderDetail = "ZONE ACTOR";
        ctx.fillText(renderDetail.toUpperCase(), bx + TEXT_PAD_L, by + 24);

        ctx.restore();
    },

    _drawStandardBadge: function(ctx, x, y, ent, layerName) {
        if(layerName === "Default" || layerName === "PlayerStart") return;

        let color = ent.__smartColor || "#333";
        if(layerName === "Core_Logic") color = "#e67e22";

        let dName = (ent.fieldInstances[0]?.__value || ent.__identifier).replace(/_/g, ' ');
        let drawResource = null;
        const upName = dName.toUpperCase();

        if (upName.includes("CAFE")) drawResource = ENTITY_ICONS.CAFE;
        else if (upName.includes("BAR")) drawResource = ENTITY_ICONS.BAR;
        else if (upName.includes("SHOP") || upName.includes("WARES") || upName.includes("STORE") || upName.includes("KIO")) drawResource = ENTITY_ICONS.SHOP;
        else if (upName.includes("PLAZA") || upName.includes("VIEW")) drawResource = ENTITY_ICONS.PLAZA;
        else if (upName.includes("ARCADE") || upName.includes("GAME")) drawResource = ENTITY_ICONS.GAME;
        else if (upName.includes("BED") || upName.includes("REST")) drawResource = ENTITY_ICONS.REST;
        else if (upName.includes("CENTER") || upName.includes("CP")) { drawResource = ENTITY_ICONS.HEAL; color = "#e74c3c"; }
        else if (upName.includes("PC") || upName.includes("TERMINAL")) { drawResource = ENTITY_ICONS.PC; color = "#3498db"; }
        else if (upName.includes("POLICE")) { drawResource = ENTITY_ICONS.POLICE; color = "#34495e"; }
        else if (layerName === "Core_Logic") drawResource = ENTITY_ICONS.WARP;

        ctx.font = "bold 11px sans-serif";
        const txtW = ctx.measureText(dName).width;
        const badgeW = 34 + txtW + 12;
        const badgeH = 28;
        const arrowH = 6;

        const bx = x - badgeW / 2;
        const by = y - badgeH / 2;

        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.96)";
        ctx.shadowColor = "rgba(0,0,0,0.12)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;

        const r = 5;
        const cxMid = bx + badgeW / 2;
        const botY = by + badgeH;

        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + badgeW - r, by);
        ctx.quadraticCurveTo(bx + badgeW, by, bx + badgeW, by + r);
        ctx.lineTo(bx + badgeW, botY - r);
        ctx.quadraticCurveTo(bx + badgeW, botY, bx + badgeW - r, botY);
        const arrowW = 8;
        ctx.lineTo(cxMid + arrowW / 2, botY);
        ctx.lineTo(cxMid, botY + arrowH);
        ctx.lineTo(cxMid - arrowW / 2, botY);
        ctx.lineTo(bx + r, botY);
        ctx.quadraticCurveTo(bx, botY, bx, botY - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();

        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = color;
        const pillS = 20;
        const pillX = bx + 4;
        const pillY = by + (badgeH - pillS) / 2;
        ctx.beginPath();
        if(ctx.roundRect) ctx.roundRect(pillX, pillY, pillS, pillS, 4);
        else ctx.rect(pillX, pillY, pillS, pillS);
        ctx.fill();

        if(drawResource) {
            ctx.save();
            ctx.translate(pillX + 1, pillY + 1);
            ctx.fillStyle = "#ffffff";
            ctx.scale(0.75, 0.75);
            ctx.fill(drawResource);
            ctx.restore();
        }

        ctx.fillStyle = "#2c3e50";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(dName, bx + 30, by + badgeH / 2 + 1);

        ctx.restore();
    },

    // 屏幕边缘白晕
    drawVignette: function(ctx) {
        const grd = ctx.createRadialGradient(
            this.w/2, this.h/2, this.h*0.4, 
            this.w/2, this.h/2, this.h*0.9
        );
        grd.addColorStop(0, "rgba(238, 242, 245, 0)");
        grd.addColorStop(1, TACTICAL_STYLE.COLOR_BG);
        ctx.fillStyle = grd;
        ctx.setTransform(1,0,0,1,0,0);
        ctx.fillRect(0,0, this.w, this.h);
    },

    drawSidePanel: function(ctx) {
        if (!this.hoverData) return;
        const d = this.hoverData;
        const width = this.w;
        const isMobile = width < 600;

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const threatInfo = THREAT_MAP[d.threat] || THREAT_MAP[0];
        const metrics = [
            { label: "REGION", value: d.regionName, color: d.regionName === "UNDEFINED" ? "#bdc3c7" : "#2c3e50" },
            { label: "BIOME",  value: d.biomeName,  color: "#16a085" },
            { label: "THREAT", value: threatInfo.label, color: threatInfo.color },
            { label: "SURFACE",value: d.surfaceName, color: "#34495e" },
            { label: "INFRA",  value: d.infraText,  color: d.infraText === "YES" ? "#e67e22" : "#95a5a6" },
            { label: "BLOCK",  value: d.obsText,    color: d.obsText === "BLOCK" ? "#c0392b" : null },
            { label: "MOVE",   value: d.travText,   color: d.travText === "CLOSED" ? "#c0392b" : null },
            { label: "TUNNEL", value: d.tunnelText, color: d.tunnelText === "FOUND" ? "#8e44ad" : null }
        ];

        ctx.save();

        if (isMobile) {
            const panelX = 8;
            const panelW = width - 16;
            const headerH = 32;
            const contentH = 108;
            const panelH = this._infoPanelCollapsed ? headerH : (headerH + contentH);
            
            // 面板背景
            ctx.fillStyle = "rgba(255,255,255,0.96)";
            ctx.shadowColor = "rgba(0,0,0,0.15)";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(panelX, 8, panelW, panelH, 8);
            } else {
                ctx.rect(panelX, 8, panelW, panelH);
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            // 使用 game.js 中的坐标转换函数（跳过0轴，Y轴反转）
            const MAP_CENTER_X = 26;
            const MAP_CENTER_Y = 26;
            let displayX = d.gx - MAP_CENTER_X;
            if (displayX >= 0) displayX += 1;
            let displayY = MAP_CENTER_Y - d.gy - 1;
            if (displayY >= 0) displayY += 1;
            
            let quadrant = "?";
            if (displayX > 0 && displayY > 0) quadrant = "S";
            else if (displayX < 0 && displayY > 0) quadrant = "A";
            else if (displayX < 0 && displayY < 0) quadrant = "B";
            else if (displayX > 0 && displayY < 0) quadrant = "N";
            
            // 标题栏（可折叠）
            const arrow = this._infoPanelCollapsed ? "▶" : "▼";
            ctx.fillStyle = "#2c3e50";
            ctx.textAlign = "left";
            ctx.font = "800 20px 'Inter', sans-serif";
            ctx.fillText(`${arrow} [${displayX}, ${displayY}] ${quadrant}`, panelX + 12, 30);
            
            // 保存标题栏点击区域
            this._infoPanelHeaderRect = { x: panelX, y: 8, w: panelW, h: headerH };
            
            // 如果折叠则跳过内容
            if (!this._infoPanelCollapsed) {
                ctx.font = "600 9px monospace";
                ctx.fillStyle = "#95a5a6";
                ctx.fillText("GRID::REF", panelX + 16, 48);

                const regionLayerId = 1;
                const regionMap = window.intGridInfoMap && window.intGridInfoMap[regionLayerId];
                const regionInfo = regionMap && regionMap[d.regionInt];
                const regionColor = regionInfo?.color || "#bdc3c7";

                const regionTextName = getIntGridTextName("Regions", d.regionInt);
                const displayRegion = (regionTextName ? regionTextName : "WILDERNESS").toUpperCase();

                ctx.fillStyle = regionColor;
                ctx.fillRect(panelX + 16, 60, 6, 6);

                ctx.fillStyle = "#2c3e50";
                ctx.font = "800 12px sans-serif";
                ctx.fillText(displayRegion, panelX + 28, 67);

                ctx.fillStyle = "#dfe6e9";
                ctx.fillRect(panelX + 110, 45, 1, 85);

                const startX = panelX + 125;
                const startY = 50;
                const cols = 4;
                const colW = (panelW - 140) / cols;
                const rowGap = 40;

                ctx.textAlign = "left";
                for (let i = 0; i < metrics.length; i++) {
                    const item = metrics[i];
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    const px = startX + col * colW;
                    const py = startY + row * rowGap;

                    ctx.fillStyle = "#bdc3c7";
                    ctx.font = "bold 8px sans-serif";
                    ctx.fillText(item.label, px, py);

                    ctx.fillStyle = item.color || "#2c3e50";
                    ctx.font = "bold 12px 'Helvetica Neue'";
                    ctx.fillText(shortenValue(item.value, 8), px, py + 14);
                }
            }

            ctx.fillStyle = threatInfo.color;
            ctx.fillRect(panelX, 8 + panelH - 4, panelW, 4);
            
            // ========== 宝可梦显示区域 ==========
            this._drawPokemonPanel(ctx, panelX, 8 + panelH + 8, panelW, d);
        } else {
            const pW = 240;
            const ox = width - pW - 20;
            const oy = 20;
            const cardH = 360;

            ctx.fillStyle = "rgba(255,255,255,0.95)";
            ctx.strokeStyle = "rgba(0,0,0,0.05)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(ox, oy, pW, cardH, 10);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ecf0f1";
            ctx.fillRect(ox, oy, pW, 80);
            // 使用 game.js 中的坐标转换函数（跳过0轴，Y轴反转）
            const MAP_CENTER_X_2 = 26;
            const MAP_CENTER_Y_2 = 26;
            // X轴：简单减法，跳过0
            let displayX_2 = d.gx - MAP_CENTER_X_2;
            if (displayX_2 >= 0) displayX_2 += 1;
            
            // Y轴：26 - gy - 1，然后跳过0
            let displayY_2 = MAP_CENTER_Y_2 - d.gy - 1;
            if (displayY_2 >= 0) displayY_2 += 1;
            
            let quadrant_2 = "?";
            if (displayX_2 > 0 && displayY_2 > 0) quadrant_2 = "S"; // 东北
            else if (displayX_2 < 0 && displayY_2 > 0) quadrant_2 = "A"; // 西北
            else if (displayX_2 < 0 && displayY_2 < 0) quadrant_2 = "B"; // 西南
            else if (displayX_2 > 0 && displayY_2 < 0) quadrant_2 = "N"; // 东南
            
            ctx.fillStyle = "#2c3e50";
            ctx.font = "bold 36px 'Helvetica Neue'";
            ctx.textAlign = "center";
            ctx.fillText(`[${displayX_2}, ${displayY_2}] ${quadrant_2}`, ox + pW/2, oy + 50);

            ctx.fillStyle = "#7f8c8d";
            ctx.font = "10px sans-serif";
            ctx.fillText("GRID DESIGNATOR", ox + pW/2, oy + 65);

            let currY = oy + 110;
            ctx.textAlign = "left";
            metrics.forEach(item => {
                ctx.fillStyle = "#95a5a6";
                ctx.font = "bold 10px sans-serif";
                ctx.fillText(item.k, ox + 25, currY);

                ctx.textAlign = "right";
                ctx.fillStyle = item.c || "#2c3e50";
                ctx.font = item.v && item.v.length > 15 ? "bold 11px sans-serif" : "bold 13px sans-serif";
                ctx.fillText(item.v || "---", ox + pW - 25, currY);

                ctx.textAlign = "left";
                ctx.strokeStyle = "#f1f2f6";
                ctx.beginPath();
                ctx.moveTo(ox + 25, currY + 6);
                ctx.lineTo(ox + pW - 25, currY + 6);
                ctx.stroke();
                currY += 34;
            });
        }

        ctx.restore();
    },

    _getSurfaceColor(id, def) {
        // 轻微调整颜色适应白色卡片
        return def || "#ecf0f1";
    },

    // ========== 面板折叠状态 ==========
    _infoPanelCollapsed: false, // 信息面板折叠状态
    _pokemonPanelCollapsed: false, // 宝可梦面板折叠状态
    _pokemonImages: null, // 图片缓存（初始化时创建）
    
    _getPokemonImageCache: function() {
        if (!this._pokemonImages) {
            this._pokemonImages = {};
        }
        return this._pokemonImages;
    },
    
    _drawPokemonPanel: function(ctx, panelX, panelY, panelW, hoverData) {
        // 获取位置信息 - 使用原始值而非显示文本
        const locationInfo = {
            gx: hoverData.gx,
            gy: hoverData.gy,
            threat: hoverData.threat,
            surfaceType: hoverData.surfaceTypeRaw || hoverData.surfaceName || 'Unknown',
            biomeZone: hoverData.biomeZoneRaw || hoverData.biomeName || 'Unknown'
        };
        
        // 从缓存获取宝可梦列表
        let pokemonList = [];
        if (window.PokemonSpawnCache) {
            pokemonList = window.PokemonSpawnCache.getForLocation(locationInfo);
        }
        
        // 威胁度名称
        const threatNames = { 0: '未知', 1: '安全', 2: '低威胁', 3: '中威胁', 4: '高威胁', 5: '极危', 6: '和平' };
        const isPeace = hoverData.threat === 6 || hoverData.threat === 0;
        
        // 面板高度
        const headerH = 28;
        const itemH = 44;
        const listH = this._pokemonPanelCollapsed ? 0 : (isPeace ? 50 : Math.min(pokemonList.length, 5) * itemH);
        const totalH = headerH + listH + (this._pokemonPanelCollapsed ? 0 : 8);
        
        // 绘制面板背景
        ctx.save();
        ctx.fillStyle = "rgba(30, 40, 55, 0.95)";
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(panelX, panelY, panelW, totalH, 8);
        } else {
            ctx.rect(panelX, panelY, panelW, totalH);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // 绘制标题栏（可点击折叠）
        ctx.fillStyle = "#3498db";
        ctx.beginPath();
        if (ctx.roundRect) {
            const radius = this._pokemonPanelCollapsed ? 8 : [8, 8, 0, 0];
            ctx.roundRect(panelX, panelY, panelW, headerH, radius);
        } else {
            ctx.rect(panelX, panelY, panelW, headerH);
        }
        ctx.fill();
        
        // 折叠箭头
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const arrow = this._pokemonPanelCollapsed ? "▶" : "▼";
        ctx.fillText(arrow + " 附近的宝可梦", panelX + 8, panelY + headerH / 2);
        
        // 威胁度标签
        const threatName = threatNames[hoverData.threat] || '未知';
        ctx.textAlign = "right";
        ctx.font = "10px sans-serif";
        ctx.fillStyle = isPeace ? "#2ecc71" : "#f1c40f";
        ctx.fillText(threatName, panelX + panelW - 12, panelY + headerH / 2);
        
        ctx.textAlign = "left";
        
        // 保存点击区域用于折叠
        this._pokemonPanelHeaderRect = { x: panelX, y: panelY, w: panelW, h: headerH };
        
        // 如果折叠则不绘制内容
        if (this._pokemonPanelCollapsed) {
            ctx.restore();
            return;
        }
        
        // 内容区域起始Y
        let contentY = panelY + headerH + 6;
        
        if (isPeace || pokemonList.length === 0) {
            // 和平区域或无宝可梦
            ctx.fillStyle = "#7f8c8d";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("这里很安全，没有野生宝可梦", panelX + panelW / 2, contentY + 20);
            ctx.textAlign = "left";
        } else {
            // 绘制宝可梦列表
            const rarityColors = {
                common: "#95a5a6",
                uncommon: "#2ecc71",
                rare: "#3498db",
                boss: "#e74c3c"
            };
            
            pokemonList.slice(0, 5).forEach((p, i) => {
                const itemY = contentY + i * itemH;
                
                // 图片区域
                const imgSize = 40;
                const imgX = panelX + 6;
                const imgY = itemY + (itemH - imgSize) / 2;
                
                // 绘制图片背景
                ctx.fillStyle = "rgba(255,255,255,0.1)";
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(imgX, imgY, imgSize, imgSize, 6);
                } else {
                    ctx.rect(imgX, imgY, imgSize, imgSize);
                }
                ctx.fill();

                // 加载并绘制图片
                this._drawPokemonSprite(ctx, p.id, imgX + 2, imgY + 2, imgSize - 4);

                // 名称
                ctx.fillStyle = rarityColors[p.rarity] || "#ffffff";
                ctx.font = "bold 12px sans-serif";
                const displayName = p.id.replace(/_/g, ' ');
                ctx.fillText(displayName.charAt(0).toUpperCase() + displayName.slice(1), panelX + 54, itemY + 16);

                // 稀有度
                ctx.fillStyle = "#7f8c8d";
                ctx.font = "9px sans-serif";
                ctx.fillText(p.rarity.toUpperCase(), panelX + 54, itemY + 30);
                
                // 等级
                ctx.fillStyle = "#f1c40f";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "right";
                ctx.fillText(`Lv.${p.level}`, panelX + panelW - 12, itemY + 20);
                ctx.textAlign = "left";
            });
        }
        
        ctx.restore();
    },
    
    _drawPokemonSprite: function(ctx, pokemonId, x, y, size) {
        // 参考index.js的完整URL处理逻辑
        const seedIdWithHyphen = pokemonId.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const seedIdCompact = pokemonId.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // 地区形态检测
        const regionalForms = ['alola', 'galar', 'hisui', 'paldea'];
        const isRegionalForm = regionalForms.some(r => seedIdWithHyphen.includes(`-${r}`) || seedIdWithHyphen.endsWith(r));
        
        // 基础ID（去除形态后缀）用于fallback
        let baseId = seedIdCompact;
        for (const r of regionalForms) {
            if (baseId.endsWith(r)) {
                baseId = baseId.slice(0, -r.length);
                break;
            }
        }
        
        // 生成URL
        let imgSrc, fallbackSrc;
        if (isRegionalForm) {
            // 地区形态使用pokesprite
            let pokespriteId = seedIdWithHyphen;
            // 确保格式正确：xxx-alola 而非 xxxalola
            for (const r of regionalForms) {
                if (seedIdCompact.endsWith(r) && !pokespriteId.includes(`-${r}`)) {
                    pokespriteId = baseId + '-' + r;
                    break;
                }
            }
            imgSrc = `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${pokespriteId}.png`;
            fallbackSrc = `https://play.pokemonshowdown.com/sprites/gen5/${baseId}.png`;
        } else {
            // 普通形态使用Showdown
            imgSrc = `https://play.pokemonshowdown.com/sprites/gen5/${seedIdCompact}.png`;
            fallbackSrc = `https://play.pokemonshowdown.com/sprites/ani/${seedIdCompact}.gif`;
        }
        
        // 检查缓存
        const cache = this._getPokemonImageCache();
        const cacheKey = seedIdCompact;
        
        if (!cache[cacheKey]) {
            const img = new Image();
            img._loadState = 'loading';
            img._triedFallback = false;
            
            img.onload = function() {
                img._loadState = 'loaded';
            };
            
            img.onerror = function() {
                if (!img._triedFallback) {
                    img._triedFallback = true;
                    img.src = fallbackSrc;
                } else {
                    img._loadState = 'failed';
                }
            };
            
            img.src = imgSrc;
            cache[cacheKey] = img;
        }
        
        const img = cache[cacheKey];
        
        // 绘制
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x, y, size, size);
        } else if (img._loadState === 'failed') {
            ctx.fillStyle = "rgba(100,150,255,0.6)";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(pokemonId.charAt(0).toUpperCase(), x + size/2, y + size/2);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
        } else {
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("...", x + size/2, y + size/2);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
        }
    },
    
    // 处理面板点击（折叠/展开）
    handlePanelClick: function(mx, my) {
        // 检查信息面板标题栏
        if (this._infoPanelHeaderRect) {
            const r = this._infoPanelHeaderRect;
            if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                this._infoPanelCollapsed = !this._infoPanelCollapsed;
                return true;
            }
        }
        
        // 检查宝可梦面板标题栏
        if (this._pokemonPanelHeaderRect) {
            const r = this._pokemonPanelHeaderRect;
            if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                this._pokemonPanelCollapsed = !this._pokemonPanelCollapsed;
                return true;
            }
        }
        
        return false;
    },
    
    // 兼容旧方法名
    handlePokemonPanelClick: function(mx, my) {
        return this.handlePanelClick(mx, my);
    }
};

window.TacticalSystem = TacticalSystem;
