import React from "react";
import ReactReconciler from "react-reconciler";
// import { DefaultEventPriority } from "react-reconciler/constants";

function cloneInstance(
    instance,
    updatePayload,
    type,
    oldProps,
    newProps,
    internalInstanceHandle,
    keepChildren,
    recyclableInstance
) {
    console.log("clone instance");
    return {
        ...instance,
        type,
        props: newProps,
        children: keepChildren ? instance.children : [],
    };
}

const reconciler = ReactReconciler({
    supportsMutation: false,
    supportsPersistence: true,
    supportsHydration: false,

    createInstance(
        type,
        props,
        rootContainerInstance,
        hostContext,
        internalInstanceHandle
    ) {
        console.log("create instance", type, props);
        return { type, props, children: [] };
    },
    appendInitialChild(parentInstance, child) {
        console.log("append initial child", parentInstance, child);
        parentInstance.children.push(child);
    },
    createTextInstance(
        text,
        rootContainerInstance,
        hostContext,
        internalInstanceHandle
    ) {
        console.log("create text", text, rootContainerInstance);
        return { text };
    },

    getPublicInstance: (instance) => instance,
    getRootHostContext() {
        return null;
    },
    getChildHostContext: (parentHostContext) => parentHostContext,
    prepareForCommit() {
        console.log("prepare commit");
        return null;
    },
    resetAfterCommit(container) {
        console.log("reset commit", container);
        return {};
    },
    finalizeInitialChildren() {
        console.log("finalize initial children");
        // If this returns `true`, `commitMount` will be called
        return false;
    },
    prepareUpdate(
        instance,
        type,
        oldProps,
        newProps,
        rootContainer,
        hostContext
    ) {
        console.log("prepare update", instance, type, oldProps, newProps);
        // Does it matter what we return here?  `commitUpdate` is never called.
        return newProps;
    },
    commitUpdate(
        instance,
        updatePayload,
        type,
        prevProps,
        nextProps,
        internalHandle
    ) {
        throw new Error("commitUpdate");
        // console.log("commit update", instance, updatePayload);
        // instance.props = updatePayload;
    },
    shouldSetTextContent() {
        return false;
    },
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,
    isPrimaryRenderer: true,
    warnsIfNotActing: true,
    getInstanceFromNode() {
        throw new Error("getInstanceFromNode");
    },
    beforeActiveInstanceBlur() {
        return undefined;
    },
    afterActiveInstanceBlur() {
        return undefined;
    },
    preparePortalMount() {
        return undefined;
    },
    prepareScopeUpdate() {
        return undefined;
    },
    getInstanceFromScope() {
        throw new Error("getInstanceFromScope");
    },
    // getCurrentEventPriority() {
    //     return DefaultEventPriority;
    // },
    detachDeletedInstance() {
        return undefined;
    },
    requestPostPaintCallback(callback) {
        console.log("request post paint callback");
        const endTime = Scheduler.unstable_now();
        callback(endTime);
    },
    prepareRendererToRender() {
        console.log("prepare renderer");
    },
    resetRendererAfterRender() {
        console.log("reset render");
    },

    cloneInstance,
    createContainerChildSet() {
        return [];
    },
    appendChildToContainerChildSet(childSet, child) {
        childSet.push(child);
    },
    finalizeContainerChildren(container, newChildren) {
        console.log("finalize container children", container, newChildren);
    },
    replaceContainerChildren(container, newChildren) {
        console.log("replace container children", container, newChildren);
        container.children = newChildren;
    },
    cloneHiddenInstance(instance, type, props, internalInstanceHandle) {
        console.log("clone hidden instance");
        return cloneInstance(
            instance,
            null,
            type,
            props,
            props,
            internalInstanceHandle,
            true,
            null
        );
    },
    cloneHiddenTextInstance(instance, text, internalInstanceHandle) {
        console.log("clone text instance");
        return { ...instance, text };
    },
});

const MyRenderer = {
    render(element, renderDom, callback) {
        console.log("render", element, renderDom, callback);
        const container = reconciler.createContainer(renderDom, false);
        reconciler.updateContainer(element, container, null, callback);
        reconciler.flushSync();
        return container;
    },
    stopRendering(container) {
        reconciler.updateContainer(null, container);
    },
};

function jsonFromInstance(instance) {
    if (instance.text !== undefined) {
        return instance.text;
    }
    const result = {
        type: instance.type,
        children: instance.children.map(jsonFromInstance),
    };
    for (const [k, v] of Object.entries(instance.props)) {
        if (k === "children") continue;
        result[k] = v;
    }
    return result;
}

const App = () => {
    const [state, setState] = React.useState("Initial");
    React.useEffect(() => {
        console.log("effect");
        setTimeout(() => {
            console.log("setting state");
            setState("Follow");
        }, 100);
        return () => {
            console.log("stop effect");
        };
    }, []);
    return (
        <bro>
            My App
            <bro state={state} />
        </bro>
    );
};

function main() {
    const root = { type: "root", props: {}, children: [] };
    const container = MyRenderer.render(<App />, root, () => {
        console.log("callback");
    });
    console.log("final", JSON.stringify(jsonFromInstance(root)));
    // MyRenderer.stopRendering(container);
    // MyRenderer.render(null, root, () => {
    //   console.log("remove callback");
    // })
}

main();
