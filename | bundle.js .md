This file is large and minified, have fun.

## `TabStrip.jsx`

### Constants at the top of the module
Make tabs as wide as possible.

```diff
+L=2000,
-L=180,
```

### In method `getStyles(e)`
Remove empty space to the right of tabs, since we removed the New Tab button.

*Ensure `Active Tab Minimum Width` is set as low as possible (30px) in Settings, otherwise the tab widths get screwy at small window sizes This is a problem even in an unmodified installation.*
```diff
+a=this.createFlexBoxLayout(this.props.tabs,this.props.direction,this.props.maxWidth+60,this.props.maxHeight
-a=this.createFlexBoxLayout(this.props.tabs,this.props.direction,this.props.maxWidth,this.props.maxHeight
```
