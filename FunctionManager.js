/**
 * ParameterManager.js
 * @authors AndyPan (pye-mail@163.com)
 * @date    2016-06-30 14:26:53
 */

(function(Global){

	//局部变量集合
	var Local = {
		//自定义事件委托存储对象
		CUSTOMDELEGATES: {},
		//Object自定义原型对象
		__PROTO__: {listen: true, on: true, bind: true, shift: true, fire: true, callee: true, kvpcallee: true}
	};

	//事件对象
	var Delegates = {},
		//内置对象
		BuiltIn = {};

	/**
	 * 添加自定义事件
	 * @param  {String} name 事件名称
	 * @param  {Function} handle 事件函数
	 * @return {Object} 当前实例对象
	 */
	Delegates.on = function(key, name, handle){
		name = name ? name.toLocaleUpperCase() : null;
		if (name && handle){
			Local.CUSTOMDELEGATES[key] = Local.CUSTOMDELEGATES[key] || {};
			Local.CUSTOMDELEGATES[key]['on'+name] = [handle];
		}
	};

	/**
	 * 绑定自定义事件
	 * @param  {String} name 事件名称
	 * @param  {Function} handle 事件函数
	 * @return {Object} 当前实例对象
	 */
	Delegates.bind = function(key, name, handle){
		name = name ? name.toLocaleUpperCase() : null;
		if (name && handle){
			Local.CUSTOMDELEGATES[key] = Local.CUSTOMDELEGATES[key] || {};
			var eventName = 'on'+name;
			Local.CUSTOMDELEGATES[key][eventName] = Local.CUSTOMDELEGATES[key][eventName] || [];
			Local.CUSTOMDELEGATES[key][eventName].push(handle);
		}
	};

	/**
	 * 触发(执行或响应)已绑定的自定义事件
	 * @param  {String} name 事件名称
	 * @param  {Array} args 需要传递给事件函数的参数集合
	 * @param  {object} posing 以对象冒充的方式替换事件函数this
	 * @return {Object} 事件返回值或当前实例对象
	 */
	Delegates.fire = function(key, name, args, posing, async) {
		name = name ? name.toLocaleUpperCase() : null;
		var handlerResult;
		var handle = function(){
			var handles = Local.CUSTOMDELEGATES[key];
			if(handles){
				handles = handles['on' + name];
				if(handles){
					var i = 0, len = handles.length, result;
					for(; i < len; i++){
						result = handles[i].apply(posing, args || []);
						if(result != undefined)
							handlerResult = result;
					}
				}
			}
		};
		if(async == false)
			handle();
		else
			setTimeout(handle, 0);

		return handlerResult;
	};

	/**
	 * 移除事件监听
	 * @param  {String} name 事件名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Object} 当前实例对象
	 */
	Delegates.shift = function(key, name, handle) {
		name = name ? name.toLocaleUpperCase() : null;
		var customDelegates = Local.CUSTOMDELEGATES, eventName = 'on' + name;
		if(name && handle) {
			var handlers = customDelegates[key];
			if(handlers){
				handlers = customDelegates[eventName];
				if(handlers){
					var i = 0, len = handlers.length;
					for(; i< len; i++){
						if(handle == handlers[i]){
							customDelegates[key].splice(i, 1);
							break;
						}
					}
				}
			}
		}
		else if(name && !handle){
			var handlers = customDelegates[key];
			if(handlers){
				handlers['on' + name] = undefined;
			}
		}
		else if(!name && !handle){
			var handlers = customDelegates[key];
			if(handlers){
				handlers = {};
			}
		}
	};

	/**
	 * 函数重写、并委托事件监听
	 * @param  {Function} fun 被重写函数
	 * @return {Function}     重写后的函数
	 */
	BuiltIn.overwrite = function(fun){
		return function(){
			var self = this;
			var result = Delegates.fire(fun, 'run', arguments, self, false);
			if(result == false){
				Delegates.fire(fun, 'end', arguments, self, false);
				return;
			}
			var result = BuiltIn.ParameterManager(arguments, fun);
			var fnResult = fun.apply(self, result[0]);

			Delegates.fire(fun, 'finish', arguments, self, false);
			return fnResult;
		};
	};

	/**
	 * 判断一个Object对象是否为JSON格式的对象
	 * @param  {Object}  obj 需要判断的对象
	 * @return {Boolean}     是否为JSON格式的对象(true|false)
	 */
	BuiltIn.isJSON = function(obj){
		return (typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]") || false;
	};

	/**
	 * 判断一个Object对象是否为Array格式的对象
	 * @param  {Object}  obj 需要判断的对象
	 * @return {Boolean}     是否为Array格式的对象(true|false)
	 */
	BuiltIn.isArray = function(obj){
		return (typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object array]") || false;
	};

	/**
	 * 对Object对象遍历并委托事件监听及其他操作
	 * @param  {String} e      需要委托的事件，包括：on、bind、fire、shift
	 * @param  {String} name   自定义事件名
	 * @param  {Function} handle 事件操作
	 * @param  {[type]} posing [description]
	 * @param  {[type]} async  [description]
	 * @return {[type]}        [description]
	 */
	BuiltIn.objectEvents = function(e, name, handle, posing, async){
		var _self = this;
		if(BuiltIn.isJSON(_self)){
			var item;
			for(var key in _self){
				item = _self[key];
				if(!Local.__PROTO__[key] && typeof(item) == 'function'){
					if(e == 'fire')
						Delegates[e](item.prototype.constructor, name, handle, posing, async);
					else
						Delegates[e](item.prototype.constructor, name, handle);
				}
			}
		}

		return _self;
	}

	/**
	 * 函数的参数管理
	 */
	BuiltIn.ParameterManager = function(){
	    var result = [], resultArgs = [], resultObjs = {'__length__': 0};
	    if(BuiltIn.isJSON(arguments[0][0])){
	        var argsObj = arguments[0][0];
	        //获取函数的参数名称集合
	        var argsName = arguments[1].paramNames();	        
	        //将参数集合数组转换成JSON对象，并赋值为'__TEMP__'
	        var argsNameObj = argsName.toJSON();

	        for(var key in argsObj){
	        	if(argsNameObj[key])
	        		argsNameObj[key] = argsObj[key];
	        	else
	        		resultObjs[key] = argsObj[key], resultObjs['__length__']++;
	        }

	        for(var key in argsNameObj){
	        	resultArgs.push(argsNameObj[key] == '__TEMP__' ? undefined : argsNameObj[key]);
	        }
	        result = [resultArgs, resultObjs['__length__'] ? resultObjs : undefined];
	    }
	    else{
	    	result = [arguments[0], resultObjs['__length__'] ? resultObjs : undefined];
	    }

	    return result;
	};

	BuiltIn.callee = function(self, args, posing){
		var result;
		if(args){
			var each = function(obj, posing){
				var res = BuiltIn.ParameterManager([obj], self);
				result = self.apply(posing || {}, res[0]);
			};
			if(BuiltIn.isArray(args)){
				var i = 0, len = args.length, item;
				for(;i<len;i++){
					item = args[i];
					if(BuiltIn.isJSON(item))
						each(item, posing);
				}
			}
			else if(BuiltIn.isJSON(args)){
				each(args, posing);
			}
		}
		return result;
	};

	/**
	 * 将数组转换成自定义的JSON格式对象
	 * @param  {Function/Array/String} defaults 被转换后JSON的Key，可以是函数，自定义key；也可以是数组，依次指定key；也可以是字符串，统一指定key
	 * @param  {Boolean} flag     一个状态，true.以自定义的key作为转换后JSON的key，已被转换的Array元素作为值，false.则反之(默认)
	 * @return {Object}          被转换后的JSON格式对象
	 */
	Array.prototype.toJSON = function(defaults, flag) {
		var tempObjs = {}, tempStr = '__TEMP__', tempAry = this, count = 0;
		if(tempAry.length){
			('['+tempAry.join('][')+']').replace(/\[[^\]]+\]/g, function(keys){
				keys = keys.replace('[', '').replace(']', '');
				tempStr = defaults ? ( (typeof(defaults) == 'function') ? defaults(keys) : (Object.prototype.toString.call(defaults).toLowerCase() === "[object array]" ? defaults[count] : defaults) ) : tempStr;
				if(flag && defaults)
					tempObjs[tempStr] = keys;
				else if(!flag)
					tempObjs[keys] = tempStr;
				count++;
			});
		}
		return tempObjs;
	};


	/**
	 * 对Object对象进行监听，对该对象下的函数进行重写并委托事件监听
	 * @param  {String} name   (重写完后)统一事件绑定名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Object}        当前Object对象
	 */
	Object.prototype.listen = function(name, handle){
		var _self = this;
		var fn = function(name, handle){
			if(BuiltIn.isJSON(_self)){
				var item;
				for(var key in _self){
					item = _self[key];
					if(!Local.__PROTO__[key] && typeof(item) == 'function'){
						_self[key] = BuiltIn.overwrite(item);
						_self[key].prototype.constructor = item;
						if(name && handle)
							Delegates.bind(item, name, handle);
					}
				}
			}
		};

		if(name){
			if(typeof(name) == 'boolean'){
				window.setTimeout(fn, 0);
			}
			else{
				fn(name, handle);
			}
		}
		else
			fn();

		return _self;
	};

	/**
	 * 对Object对象下所有函数对象统一添加事件委托(只保留最后一次添加的)
	 * @param  {String} name   委托事件名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Object}        当前Object对象
	 */
	Object.prototype.on = function(name, handle){
		return BuiltIn.objectEvents.call(this, 'on', name, handle);
	};

	/**
	 * 对Object对象下所有函数对象统一绑定事件委托(每次绑定的都存在)
	 * @param  {String} name   委托事件名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Object}        当前Object对象
	 */
	Object.prototype.bind = function(name, handle){
		return BuiltIn.objectEvents.call(this, 'bind', name, handle);
	};

	/**
	 * 对Object对象下所有函数对象统一事件委托进行删除
	 * @param  {String} name   委托事件名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Object}        当前Object对象
	 */
	Object.prototype.shift = function(name, handle){
		return BuiltIn.objectEvents.call(this, 'shift', name, handle);
	};

	/**
	 * 对Object对象下所有函数对象统一事件委托进行触发
	 * @param  {String} name   委托事件名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Object}        当前Object对象
	 */
	Object.prototype.fire = function(name, handle){
		return BuiltIn.objectEvents.call(this, 'fire', name, handle);
	};


	/**
	 * 对单个函数对象添加事件委托(只保留最后一次添加的)
	 * @param  {String} name   委托事件名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Function}        当前Function对象
	 */
	Function.prototype.on = function(name, handle){
		var _self = this;
		Delegates.on(_self.prototype.constructor, name, handle);
		return _self;
	};

	/**
	 * 对单个函数对象绑定事件委托(每次绑定的都存在)
	 * @param  {String} name   委托事件名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Object}        当前Object对象
	 */
	Function.prototype.bind = function(name, handle){
		var _self = this;
		Delegates.bind(_self.prototype.constructor, name, handle);
		return _self;
	};

	/**
	 * 对单个函数对象事件委托进行删除
	 * @param  {String} name   委托事件名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Object}        当前Object对象
	 */
	Function.prototype.shift = function(name, handle){
		var _self = this;
		Delegates.shift(_self.prototype.constructor, name, handle);
		return _self;
	};

	/**
	 * 对单个函数对象事件委托进行触发
	 * @param  {String} name   委托事件名称
	 * @param  {Function} handle 事件操作函数
	 * @return {Object}        当前Object对象
	 */
	Function.prototype.fire = function(name, args, posing, async){
		var _self = this;
		Delegates.fire(_self.prototype.constructor, name, args, posing, async);
		return _self;
	};

	/**
	 * 函数生命周期事件委托仅限于对象下的函数，因为对象下的函数体是可监听和重写的，而一个普通函数无法实现监听并重写，
	 * 因此，要想普通函数也可以进行生命周期事件委托管理，添加委托的方式不变，只是在调用时需要使用run方可进行重写和监听
	 * @return {Function} 当前函数对象
	 */
	Function.prototype.run = function(){
		var _self = this;
		BuiltIn.overwrite(_self)(arguments);
		return _self;
	};

	/**
	 * 获取一个函数的所有参数名字
	 * @return {Array} 参数名字数组集合
	 */
	Function.prototype.paramNames = function(){
		return this.toString()
				.split('\n')[0].match(/\([^\)]+\)/g).toString()
				.replace('(', '').replace(')', '')
				.replace(new RegExp(' ', "gm"), '').split(',');
	};
	
	/**
	 * 如果一个函数有多个参数，其中部分参数又不是必须的，可以采用该方法对参数进行统一管理，只需传入一个JSON对象，
	 * 以原函数的参数名作为JSON对象的key，传入必要的参数
	 * @return {Object} 原函数的返回值
	 */
	Function.prototype.callee = function(objs, posing){
		return BuiltIn.callee(this, objs, posing);
	};

	/**
	 * 在面对设置一个键值对操作的时候，也许你会面临设置一个键值对集合，没关系，你不用去循环，该方法可以帮你完成
	 * @param  {Array/JSON Object} objs 键值对集合对象
	 * @return {Object}      原函数的返回值
	 */
	Function.prototype.kvpcallee = function(objs, posing){
		var result, _self = this;
		if(objs){
			var each = function(obj, posing){
				for(var key in obj){
					if(!Local.__PROTO__[key])
						result = _self.apply(posing || {}, [key, obj[key]]);
				}
			};
			if(BuiltIn.isArray(objs)){
				var i = 0, len = objs.length, item;
				for(;i<len;i++){
					item = objs[i];
					if(BuiltIn.isJSON(item))
						each(item, posing);
				}
			}
			else if(BuiltIn.isJSON(objs))
				each(objs, posing);
		}
		return result;
	};

})(window);


