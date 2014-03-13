KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('zepto-adapter', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','gallery/zepto-adapter/1.0/']});