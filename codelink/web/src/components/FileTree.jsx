import React from "react";
import {
    syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";

function GetChildren(parent) {
    async () => {
        try {
            const res = await fetch(`/api/getchildren/${parent}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Could not load children");
            console.log(data)
            return data
        } catch (e){
           console.log(e)
        }
    }
}

export default function FileTree() {
    console.log("start")
    const tree = useTree ({
        rootItemId: "0",
        dataLoader: {
            getItem: (itemId) => {itemId},
            getChildren: (itemId) => GetChildren(itemId),
        },
        indent: 20,
        features: [syncDataLoaderFeature],
    });
    console.log("end")
    console.log(tree.dataLoader)
    return (
        <div {...tree.getContainerProps()} className="tree">
            {tree.getItems().map((item) => (
                <button
                    {...item.getProps()}
                    key={item.getId()}
                    style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
                >
                    <div
                        className={"treeitem", {
                            focused: item.isFocused(),
                            expanded: item.isExpanded(),
                            selected: item.isSelected(),
                            folder: item.isFolder(),
                        }}
                    >
                        {item.getItemName()}
                    </div>
                </button>
            ))}
        </div>
    );
};