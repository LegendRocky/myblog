define(['jquery'], function($){
	var str = '';
	str += '<div class="note-title"><i class="icon-file-text2"></i>';
	str += '<div class="d-note-title"><p class="sub-head">无标题文章</p>';
	str += '<p class="sub-content">无标题文章123</p></div></div>';		
	function AddPost(el){
		this.$el = $(el);
		this.$el.on('click', function(){
			$(this).after(str);
		})
	}
	$.fn.extend({
		addpost : function(){
			return new AddPost(this);
		}
	})
})