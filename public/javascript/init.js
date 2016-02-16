define(['jquery'], function($){
	var w = $('a.login');
	var z = 0;
	w.forEach(function(index,w){
		z += w.width();
	})
	return {
		z : z
	}
})