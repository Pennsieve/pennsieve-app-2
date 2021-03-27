This based on a production built version of vue-jstree (2.1.6) by zdy1988:

https://github.com/zdy1988/vue-jstree

it contains a very small change which was necessary to increase performance in large trees, previously hidden tree nodes were still displayed in the dom, this change only inserts tree nodes into the dom when they are expanded, see the change here and what project this is being built from here:

https://github.com/madmax141/vue-jstree/commit/8738637109935672fd185c968901b9eec93684ba

including a production distributed version to avoid having to deal with new and otherwise unused packages/loaders

