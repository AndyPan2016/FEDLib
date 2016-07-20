# Function Helper

函数操作辅助类，主要是对参数的管理

## 案例

- 函数对象

	``` javascript
	var MyClass = function(){
		var self = this;

		var attr = {};

		self.set = function(key, val){
			if(key && val)
				attr[key] = val;
			return self;
		}

		self.get = function(){
			console.info(attr);
		};

		self.listen();
	};

	var clas = new MyClass();

	//方式一(输出：{default: "default"})
	clas.set('default', 'default').get();
	//方式二(输出：{default: "default", model1: "model1"})
	clas.set({key: 'model1', val: 'model1'}).get();
	//方式三(输出：{default: "default", model1: "model1", model2: "model2"})
	clas.set.kvpcallee({'model2': 'model2'}, clas).get();
	//方式四(输出：{default: "default", model1: "model1", model2: "model2", model3: "model3", model4: "model4"})
	clas.set.kvpcallee({model3: 'model3', model4: 'model4'}, clas).get();
	//方式五(输出：{default: "default", model1: "model1", model2: "model2", model3: "model3", model4: "model4", model5: "model5", model6: "model6"})
	clas.set.kvpcallee([{model5: 'model5'}, {model6: 'model6'}], clas).get();

	``` 

- JSON对象
	
	``` javascript
	var clas = {
		attr: {},
		set: function(key, val){
			if(key && val)
				this.attr[key] = val;
			return this;
		},
		get: function(){
			console.info(this.attr);
		}
	}.listen();

	//方式一(输出：{default: "default"})
	clas.set('default', 'default').get();
	//方式二(输出：{default: "default", model1: "model1"})
	clas.set({key: 'model1', val: 'model1'}).get();
	//方式三(输出：{default: "default", model1: "model1", model2: "model2"})
	clas.set.kvpcallee({'model2': 'model2'}, clas).get();
	//方式四(输出：{default: "default", model1: "model1", model2: "model2", model3: "model3", model4: "model4"})
	clas.set.kvpcallee({model3: 'model3', model4: 'model4'}, clas).get();
	//方式五(输出：{default: "default", model1: "model1", model2: "model2", model3: "model3", model4: "model4", model5: "model5", model6: "model6"})
	clas.set.kvpcallee([{model5: 'model5'}, {model6: 'model6'}], clas).get();

	``` 

- 函数字面量

	``` javascript
	var fun = function(name, age, sex, hobby){
		var person = {};
		person.name = name || '[No Name]';
		person.age = age || '[No Age]';
		person.sex = sex || '[No Sex]';
		person.hobby = hobby || '[No hobby]';

		console.info(person);
	};

	//情景一：假如有一个模拟person对象，但它的信息不完整
	var mock = {
		name: '张三',
		hobby: '兴趣爱好'
	};
	//方式一(每一个参数，即使没有值，也必须需要一个占位, 并且顺序不能变)
	fun(mock.name, null, null, mock.hobby);
	//方式二(首先要保证模拟数据的key与fun函数的对应参数名一致)
	fun.callee(mock);
	//情景二：假如有一组模拟person对象，同样它的信息不完整
	var mock = [
		{name: '李四', age: 21},
		{name: '王五', sex: '男'},
		{sex: '女', hobby: '跳舞'}
	];
	//方式一(需要一个循环来遍历)
	var i = 0, len = mock.length, item;
	for(;i<len;i++){
		item = mock[i];
		fun(item.name, item.age, item.sex, item.hobby);
	}
	//方式二
	fun.callee(mock);

	``` 