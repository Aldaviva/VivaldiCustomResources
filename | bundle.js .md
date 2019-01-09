This file is large and minified, have fun.

## `TabStrip.jsx`

### Constants at the top of the module
[Make tabs as wide as possible.](https://gist.github.com/Aldaviva/39e4472ab7a5ee50473de74df826d928)

```diff
-U=180,
+U=2000,
```

### In method `getStyles(e)`
Remove empty space to the right of tabs, since we removed the New Tab button.

*Ensure `Active Tab Minimum Width` is set as low as possible (30px) in Settings, otherwise the tab widths get screwy at small window sizes. This is a problem even in an unmodified installation.*
```diff
-const t=this.createFlexBoxLayout(this.props.tabs,this.props.direction,this.props.maxWidth,this.props.maxHeight
+const t=this.createFlexBoxLayout(this.props.tabs,this.props.direction,this.props.maxWidth+60,this.props.maxHeight
```
