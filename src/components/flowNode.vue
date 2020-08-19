<script>
import { defineComponent } from '@vue/composition-api';
import { Tooltip } from 'element-ui';
import flowPanelNode from './node';
export default defineComponent({
  name: 'flow-node-with-tooltip',
  props: {
    node: {
      type: Object,
      default: function() {
        return {};
      },
    },
    data: {
      type: Object,
      default: function() {
        return {};
      },
    },
    activeElement: {
      type: Object,
      default: function() {
        return {};
      },
    },
    status: { type: Number, default: null },
  },
  setup(props, { emit }) {
    const clickNode = () => {
      emit('clickNode', props.node);
    };
    const deleteElement = () => {
      emit('deleteElement');
    };
    const changeNodeSite = (data) => {
      emit('changeNodeSite', data);
    };
    return () => (
      <div>
        {props.node.type == 'table' && (
          <Tooltip
            placement="top"
            effect="dark"
            popper-class="container_node-tooltip"
          >
            <div slot="content">
              <flowPanelNode
                id={props.node.id}
                isOnlyTooltip={true}
                data={props.data}
                node={props.node}
                status={props.status}
                activeElement={props.activeElement}
              />
            </div>
            <flowPanelNode
              id={props.node.id}
              data={props.data}
              node={props.node}
              status={props.status}
              activeElement={props.activeElement}
              onDeleteElement={deleteElement}
              onChangeNodeSite={changeNodeSite}
              onClickNode={clickNode}
            />
          </Tooltip>
        )}
        {props.node.type != 'table' && (
          <flowPanelNode
            id={props.node.id}
            data={props.data}
            node={props.node}
            status={props.status}
            activeElement={props.activeElement}
            onDeleteElement={deleteElement}
            onChangeNodeSite={changeNodeSite}
            onClickNode={clickNode}
          />
        )}
      </div>
    );
  },
});
</script>
