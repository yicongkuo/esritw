$(document).ready(function(){
/****************************
 *  編輯器
 ****************************/
hljs.configure({   // optionally configure hljs
  languages: ['javascript', 'ruby', 'python']
});
/// 設定編輯器
var toolbarOptions = [
      [{ header: [2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'align': [] }],
      ['image', 'code-block']
	// ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
	// // ['blockquote'],
	// ['code-block'],

	// [{ 'header': 2 }, { 'header': 6 }],               // custom button values
	// [{ 'list': 'ordered'}, { 'list': 'bullet' }],
	// [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
	// [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
	// [{ 'direction': 'rtl' }],                         // text direction

	// [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
	// [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

	// [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
	// [{ 'font': [] }],

	// ['clean']                                         // remove formatting button
];

var editorOptions = {
	// debug: 'info',
	modules: {
		syntax: true,
		toolbar: {
			container: toolbarOptions,
            handlers: {
            	image: imageHandler
            }
		}
	},
	placeholder: '撰寫內文',
	readOnly: false,
	theme: 'snow'
};

/// 建立編輯器
var editorDiv = $('#editor').get(0);
var editor = new Quill(editorDiv, editorOptions);

/****************************
 *  按鈕事件
 ****************************/
$('#saved').on('click', function (){
	var content = editor.root.innerHTML;
	console.log(content);

});


function imageHandler() {
    var range = this.quill.getSelection();
    var value = prompt('please copy paste the image url here.');
    if(value){
        this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
    }
}

}); // End of $(document)