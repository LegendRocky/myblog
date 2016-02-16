define(['jquery'], function($){
	funcion Scroll(el){
			this._checkPosition();
	}
	Scroll.prototype._checkPosition = function(){
		if($(window).scrollTop() > 0){
			this.$el.fadeIn(1000);
		}else{
			this.$el.fadeOut(1000);
		}
		$('#my_elem').bind('mousewheel', function(event, delta, deltaX, deltaY) {  
    if (window.console && console.log) {  
         console.log(delta, deltaX, deltaY);  
    }  
}); 
	}
	$.fn.extend({
		scroll : function(){
			return new Scroll(this);
		}
	})
})