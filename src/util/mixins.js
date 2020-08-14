export const easyFlowMixin = {
  data() {
    return {
      jsplumbSetting: {
        // 动态锚点、位置自适应
        Anchors: [
          'Top',
          'TopCenter',
          'TopRight',
          'TopLeft',
          'Right',
          'RightMiddle',
          'Bottom',
          'BottomCenter',
          'BottomRight',
          'BottomLeft',
          'Left',
          'LeftMiddle',
        ],
        // 容器ID
        // Container: 'flowContainer',
        Connector: [
          'Flowchart',
          {
            stub: 30,
            gap: 1,
            alwaysRespectStubs: false,
            midpoint: 0.5,
            cornerRadius: 10,
          },
        ],
        // Connector: ['StateMachine', {margin: 5, curviness: 10, proximityLimit: 80}],
        // 鼠标不能拖动删除线
        ConnectionsDetachable: false,
        // 删除线的时候节点不删除
        DeleteEndpointsOnDetach: false,
        /**
         * 空白端点
         */
        Endpoint: ['Blank', { Overlays: '' }],
        /**
         * 连线的两端端点样式
         * fill: 颜色值，如：#12aabb，为空不显示
         * outlineWidth: 外边线宽度
         */
        // 是否打开jsPlumb的内部日志记录
        LogEnabled: true,
        /**
         * 连线的样式
         */
        PaintStyle: {
          // 线的颜色
          stroke: '#1890FF',
          // 线的粗细，值越大线越粗
          strokeWidth: 1,
          // 设置外边线的颜色，默认设置透明，这样别人就看不见了，点击线的时候可以不用精确点击，参考 https://blog.csdn.net/roymno2/article/details/72717101
          outlineStroke: 'transparent',
          // 线外边的宽，值越大，线的点击范围越大
          outlineWidth: 10,
        },
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        setDragAllowedWhenFull: true,
        /**
         *  叠加 参考： https://www.jianshu.com/p/d9e9918fd928
         */
        Overlays: [
          // 箭头叠加
          [
            'Arrow',
            {
              width: 10, // 箭头尾部的宽度
              length: 8, // 从箭头的尾部到头部的距离
              location: 1, // 位置，建议使用0～1之间
              direction: 1, // 方向，默认值为1（表示向前），可选-1（表示向后）
              foldback: 1, // 折回，也就是尾翼的角度，默认0.623，当为1时，为正三角
            },
          ],
          [
            'Label',
            {
              label: '',
              location: 0.1,
              cssClass: 'aLabel',
            },
          ],
        ],
        // 绘制图的模式 svg、canvas
        RenderMode: 'svg',
        // EndpointHoverStyle: {fill: 'red'}
        Scope: 'jsPlumb_DefaultScope', // 范围，具有相同scope的点才可连接
      },
      /**
       * 连线参数
       */
      jsplumbConnectOptions: {
        isSource: true,
        isTarget: true,
        // 动态锚点、提供了4个方向 Continuous、AutoDefault
        anchor: 'Continuous',
      },
      /**
       * 源点配置参数
       */
      jsplumbSourceOptions: {
        // 设置可以拖拽的类名，只要鼠标移动到该类名上的DOM，就可以拖拽连线
        filter: '.flow-node-drag',
        filterExclude: false,
        anchor: 'Continuous',
        allowLoopback: false,
        maxConnections: 1,
        onMaxConnections: function(info) {
          console.log(`超过了最大值连线: ${info.maxConnections}`);
        },
      },
      // 参考 https://www.cnblogs.com/mq0036/p/7942139.html
      jsplumbSourceOptions2: {
        // 设置可以拖拽的类名，只要鼠标移动到该类名上的DOM，就可以拖拽连线
        filter: '.flow-node-drag',
        filterExclude: false,
        // anchor: 'Continuous',
        allowLoopback: false,
        connector: ['Flowchart', { curviness: 50 }],
        connectorStyle: {
          // 线的颜色
          stroke: 'red',
          // 线的粗细，值越大线越粗
          strokeWidth: 1,
          // 设置外边线的颜色，默认设置透明，这样别人就看不见了，点击线的时候可以不用精确点击，参考 https://blog.csdn.net/roymno2/article/details/72717101
          outlineStroke: 'transparent',
          // 线外边的宽，值越大，线的点击范围越大
          outlineWidth: 10,
        },
        connectorHoverStyle: { stroke: 'red', strokeWidth: 2 },
      },
      jsplumbTargetOptions: {
        // 设置可以拖拽的类名，只要鼠标移动到该类名上的DOM，就可以拖拽连线
        filter: '.flow-node-drag',
        filterExclude: false,
        anchor: 'Continuous',
        allowLoopback: false,
        dropOptions: { hoverClass: 'drop-hover' },
      },
    };
  },
};
