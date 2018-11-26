## `TabStrip.jsx`

### In method `getStyles(e)`
```diff
+a=this.createFlexBoxLayout(this.props.tabs,this.props.direction,this.props.maxWidth+65,this.props.maxHeight
-a=this.createFlexBoxLayout(this.props.tabs,this.props.direction,this.props.maxWidth,this.props.maxHeight
```

### Constants at the top of the module
```diff
+L=2000,
-L=180,
```