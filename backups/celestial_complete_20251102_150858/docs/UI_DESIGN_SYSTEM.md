# Phobetron UI Design System
**Official Design Standard for All Development Phases**

> **MANDATORY**: All components must follow this design system to ensure consistent, readable, accessible interfaces.

---

## 🎨 Design Philosophy

### Core Principles
1. **Space Theme**: Pure black (`bg-black`) background representing the cosmos
2. **High Contrast**: Explicit text colors required for readability on dark backgrounds
3. **Consistency**: Same colors across all features so users learn the visual language
4. **Accessibility**: WCAG AAA compliance for text contrast ratios
5. **Catalyst UI Compatible**: Overrides Catalyst's dark mode defaults where needed

### Why This System Exists

**Catalyst UI** uses Tailwind's `dark:` variants which assume lighter dark backgrounds like `bg-slate-900`.  
**Phobetron** uses `bg-black` (rgb(0,0,0)) for a true space theme, requiring explicit text colors for sufficient contrast.

**Validation**: This system was developed after user testing revealed poor text visibility on the Prophecy Codex page. After applying explicit color classes, readability improved dramatically.

---

## 📝 Text Color Standards

### Headings & Important Text

```tsx
// Page titles (highest importance)
<h1 className="text-white">Main Heading</h1>
<Heading className="text-white">Section Title</Heading>

// Card titles
<CardTitle className="text-white">Card Title</CardTitle>

// Alternative for slightly softer headings
<h2 className="text-gray-100">Subheading</h2>
```

**Use Cases**: Page titles, section headings, card titles, modal titles, dialog headers

---

### Labels & Descriptive Text

```tsx
// Form labels (bright enough to read easily)
<Label className="text-gray-200">Field Name</Label>

// Card descriptions (readable but not overwhelming)
<CardDescription className="text-gray-300">
  Description text that provides context
</CardDescription>

// Body paragraphs
<p className="text-gray-300">
  Regular body text for paragraphs, descriptions, and explanations.
</p>

// Table cells (standard content)
<TableCell className="text-gray-300">Cell content</TableCell>
```

**Use Cases**: Form labels, card descriptions, body text, table content, helper text

---

### Special Purpose Text

```tsx
// Code snippets, scripture references, technical identifiers
<code className="text-cyan-300 bg-zinc-800 px-2 py-1 rounded">
  JOEL_2:31
</code>
<span className="text-cyan-300">{scriptureRef}</span>

// Numbers, dates, statistics (data visualization)
<span className="text-blue-400 font-semibold">{count}</span>
<time className="text-blue-400">{eventDate}</time>

// Muted/secondary information (use sparingly!)
<span className="text-gray-400 text-sm">
  Last updated 2 days ago
</span>
```

**Use Cases**: 
- **Cyan**: Scripture references, code blocks, technical IDs, API endpoints
- **Blue**: Numbers, dates, counts, percentages, measurements
- **Gray-400**: Timestamps, metadata, truly secondary info (use sparingly)

---

## 🎯 Background Colors

### Card Containers

```tsx
// Standard card (with border)
<Card className="bg-zinc-900 border-zinc-800">
  <CardContent>Content goes here</CardContent>
</Card>

// Floating card (no border, glass effect)
<div className="bg-zinc-900/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
  Content with subtle transparency
</div>

// Nested card (slightly lighter)
<div className="bg-zinc-800 rounded-lg p-4">
  Nested content within a zinc-900 parent
</div>
```

**Use Cases**: Content panels, stat cards, prophecy items, event cards, info boxes

---

### Form Inputs

```tsx
// Text inputs
<Input 
  className="bg-zinc-800 text-white border-zinc-700 
             focus:border-cyan-500 focus:ring-cyan-500/20
             placeholder:text-gray-500"
  placeholder="Enter value..."
/>

// Select dropdowns
<Select className="bg-zinc-800 text-white border-zinc-700">
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</Select>

// Textareas
<Textarea 
  className="bg-zinc-800 text-white border-zinc-700
             focus:border-cyan-500 focus:ring-cyan-500/20"
  rows={4}
/>

// Checkboxes (Catalyst handles these well)
<Checkbox />

// Radio buttons (Catalyst handles these well)
<Radio />
```

**Focus States**: Always use `focus:border-cyan-500 focus:ring-cyan-500/20` for consistency

---

### Interactive States

```tsx
// Hover states for clickable items
<button className="hover:bg-zinc-800/50 transition-colors duration-200">
  Hover me
</button>

// Active/selected states
<div className="bg-zinc-800 ring-2 ring-cyan-500">
  Selected item
</div>

// Disabled states
<Input 
  disabled 
  className="bg-zinc-900 text-gray-500 border-zinc-800 cursor-not-allowed 
             opacity-50"
/>
```

---

## 🏷️ Badge Color System

Badges are color-coded to convey meaning instantly. **Do not deviate** from this system to maintain consistency.

### Status Badges (Fulfillment Status)

```tsx
// ✅ Fulfilled (green)
<Badge color="green" className="bg-green-500/10 text-green-400 ring-green-500/20">
  Fulfilled
</Badge>

// 🟡 Partially Fulfilled (yellow)
<Badge color="yellow" className="bg-yellow-500/10 text-yellow-400 ring-yellow-500/20">
  Partially Fulfilled
</Badge>

// ❌ Unfulfilled (red)
<Badge color="red" className="bg-red-500/10 text-red-400 ring-red-500/20">
  Unfulfilled
</Badge>
```

**Use Cases**: Prophecy fulfillment status, task completion, validation results

---

### Significance Badges (Priority Level)

```tsx
// 🔴 Critical (red)
<Badge color="red" className="bg-red-500/10 text-red-400 ring-red-500/20">
  Critical
</Badge>

// 🟣 High (purple)
<Badge color="purple" className="bg-purple-500/10 text-purple-400 ring-purple-500/20">
  High
</Badge>

// 🔵 Medium (blue)
<Badge color="blue" className="bg-blue-500/10 text-blue-400 ring-blue-500/20">
  Medium
</Badge>

// ⚪ Low (zinc/gray)
<Badge color="zinc" className="bg-zinc-500/10 text-zinc-400 ring-zinc-500/20">
  Low
</Badge>
```

**Use Cases**: Prophecy significance, alert priority, event importance

---

### Category Badges (Event Types)

```tsx
// 🌙 Celestial Sign (cyan)
<Badge color="cyan" className="bg-cyan-500/10 text-cyan-400 ring-cyan-500/20">
  Celestial Sign
</Badge>

// 🌍 Terrestrial Event (yellow)
<Badge color="yellow" className="bg-yellow-500/10 text-yellow-400 ring-yellow-500/20">
  Terrestrial Event
</Badge>

// ✨ Spiritual Event (purple)
<Badge color="purple" className="bg-purple-500/10 text-purple-400 ring-purple-500/20">
  Spiritual Event
</Badge>
```

**Use Cases**: Event categorization, prophecy types, timeline filtering

---

## 📊 Table Styling

```tsx
<Table>
  <TableHead>
    <TableRow>
      {/* Headers - medium gray for good contrast against black */}
      <TableHeader className="text-gray-300">Column Name</TableHeader>
      <TableHeader className="text-gray-300">Another Column</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow className="hover:bg-zinc-900/50">
      {/* Important cells - white (e.g., titles, names) */}
      <TableCell className="font-medium text-white">
        Primary Value
      </TableCell>
      
      {/* Regular cells - light gray */}
      <TableCell className="text-gray-300">
        Secondary Value
      </TableCell>
      
      {/* Code/reference cells - cyan */}
      <TableCell>
        <code className="text-xs bg-zinc-800 px-2 py-1 rounded text-cyan-300">
          REF_CODE
        </code>
      </TableCell>
      
      {/* Numeric cells - blue */}
      <TableCell className="text-blue-400 font-semibold">
        42
      </TableCell>
      
      {/* Badge cells - use badge component */}
      <TableCell>
        <Badge color="green" className="bg-green-500/10 text-green-400 ring-green-500/20">
          Active
        </Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Best Practices**:
- Headers: `text-gray-300`
- Primary column (title/name): `text-white font-medium`
- Regular columns: `text-gray-300`
- Code columns: `text-cyan-300 bg-zinc-800`
- Numbers: `text-blue-400`
- Hover row: `hover:bg-zinc-900/50`

---

## 📝 Complete Form Example

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, Textarea, Button, Label } from '@/components/catalyst';

<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  {/* Text Input */}
  <div>
    <Label htmlFor="title" className="text-gray-200">
      Prophecy Title *
    </Label>
    <Input
      id="title"
      {...register('title')}
      className="bg-zinc-800 text-white border-zinc-700 
                 focus:border-cyan-500 focus:ring-cyan-500/20"
      placeholder="Enter prophecy title..."
    />
    {errors.title && (
      <p className="text-red-400 text-sm mt-1">
        {errors.title.message}
      </p>
    )}
  </div>

  {/* Textarea */}
  <div>
    <Label htmlFor="interpretation" className="text-gray-200">
      Interpretation
    </Label>
    <Textarea
      id="interpretation"
      {...register('interpretation')}
      rows={4}
      className="bg-zinc-800 text-white border-zinc-700
                 focus:border-cyan-500 focus:ring-cyan-500/20"
      placeholder="Provide theological interpretation..."
    />
  </div>

  {/* Select Dropdown */}
  <div>
    <Label htmlFor="status" className="text-gray-200">
      Fulfillment Status
    </Label>
    <Select
      id="status"
      {...register('status')}
      className="bg-zinc-800 text-white border-zinc-700"
    >
      <option value="">Select status...</option>
      <option value="unfulfilled">Unfulfilled</option>
      <option value="partially_fulfilled">Partially Fulfilled</option>
      <option value="fulfilled">Fulfilled</option>
    </Select>
  </div>

  {/* Button Group */}
  <div className="flex gap-3 justify-end">
    <Button 
      type="button" 
      color="zinc" 
      outline
      onClick={handleCancel}
    >
      Cancel
    </Button>
    <Button 
      type="submit" 
      color="cyan"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Saving...' : 'Save Prophecy'}
    </Button>
  </div>
</form>
```

---

## 📈 Stats Card Pattern

```tsx
<Card className="bg-zinc-900 border-zinc-800">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="text-white">Total Prophecies</CardTitle>
      <div className="text-cyan-400">
        <ChartBarIcon className="w-6 h-6" />
      </div>
    </div>
    <CardDescription className="text-gray-300">
      All recorded prophecies in the database
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-4xl font-bold text-blue-400">42</p>
    <p className="text-sm text-gray-400 mt-1">
      Last updated: Nov 1, 2025
    </p>
    <div className="mt-4 pt-4 border-t border-zinc-800">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">This month:</span>
        <span className="text-green-400 font-semibold">+3</span>
      </div>
    </div>
  </CardContent>
</Card>
```

**Pattern Breakdown**:
- Card background: `bg-zinc-900 border-zinc-800`
- Title: `text-white`
- Description: `text-gray-300`
- Icon: `text-cyan-400`
- Big number: `text-4xl font-bold text-blue-400`
- Metadata: `text-gray-400`
- Divider: `border-zinc-800`
- Change indicator: `text-green-400` (positive) or `text-red-400` (negative)

---

## 🚦 Alert/Notification Patterns

```tsx
import { AlertBanner } from '@/components/catalyst/alert-banner';

// Success alert
<AlertBanner type="success" className="mb-4">
  Prophecy saved successfully!
</AlertBanner>

// Error alert
<AlertBanner type="error" className="mb-4">
  Failed to save prophecy. Please try again.
</AlertBanner>

// Warning alert
<AlertBanner type="warning" className="mb-4">
  This prophecy has no associated celestial events.
</AlertBanner>

// Info alert
<AlertBanner type="info" className="mb-4">
  Blood moon approaching on November 8, 2025.
</AlertBanner>
```

**Toast Notifications** (use sparingly for non-intrusive feedback):
```tsx
import { showToast } from '@/lib/toast';

// Success
showToast.success('Changes saved!');

// Error
showToast.error('Network error occurred');

// Custom prophecy-related toasts
showToast.prophecySaved('Joel 2:31');
showToast.bloodMoonAlert('November 8, 2025');
showToast.correlationFound('Matthew 24:29', 'Eclipse 2025-11-08');
```

---

## 🎭 Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12">
  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
    <BookOpenIcon className="w-8 h-8 text-gray-400" />
  </div>
  <h3 className="text-lg font-semibold text-white mb-2">
    No Prophecies Found
  </h3>
  <p className="text-gray-300 text-center max-w-md mb-6">
    Get started by adding your first prophecy to the codex.
  </p>
  <Button color="cyan" onClick={handleAddProphecy}>
    Add Prophecy
  </Button>
</div>
```

**Pattern**:
- Icon background: `bg-zinc-800`
- Icon color: `text-gray-400`
- Heading: `text-white`
- Description: `text-gray-300`
- CTA button: `color="cyan"`

---

## 📱 Responsive Considerations

```tsx
// Mobile-first responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
  Responsive Heading
</h1>

// Responsive grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// Responsive padding/spacing
<div className="p-4 md:p-6 lg:p-8">
  Content with responsive padding
</div>

// Hide on mobile, show on desktop
<div className="hidden lg:block">
  Desktop-only content
</div>

// Show on mobile, hide on desktop
<div className="block lg:hidden">
  Mobile-only content
</div>
```

---

## ✅ Implementation Checklist

Use this checklist when building **any new component**:

### Text Colors
- [ ] All headings use `text-white` or `text-gray-100`
- [ ] All labels use `text-gray-200`
- [ ] All body text uses `text-gray-300`
- [ ] Code/references use `text-cyan-300`
- [ ] Numbers/dates use `text-blue-400`
- [ ] Secondary info uses `text-gray-400` (sparingly)

### Backgrounds
- [ ] All cards use `bg-zinc-900 border-zinc-800`
- [ ] All inputs use `bg-zinc-800 text-white border-zinc-700`
- [ ] Focus states use `focus:border-cyan-500 focus:ring-cyan-500/20`
- [ ] Hover states use `hover:bg-zinc-800/50`

### Badges
- [ ] Status badges follow green/yellow/red system
- [ ] Significance badges follow red/purple/blue/zinc system
- [ ] Category badges follow cyan/yellow/purple system
- [ ] All badges use `/10` background opacity and `/20` ring opacity

### Tables
- [ ] Headers use `text-gray-300`
- [ ] Primary cells (titles) use `text-white font-medium`
- [ ] Regular cells use `text-gray-300`
- [ ] Code cells use `text-cyan-300 bg-zinc-800`
- [ ] Number cells use `text-blue-400`
- [ ] Row hover uses `hover:bg-zinc-900/50`

### Accessibility
- [ ] All form inputs have associated labels
- [ ] Focus states are clearly visible
- [ ] Color is not the only means of conveying information
- [ ] Text contrast ratios meet WCAG AAA standards
- [ ] Interactive elements have adequate touch targets (44x44px minimum)

---

## 🎯 Common Patterns Quick Reference

### Button Styles
```tsx
// Primary action
<Button color="cyan">Save</Button>

// Secondary action
<Button color="zinc" outline>Cancel</Button>

// Danger action
<Button color="red">Delete</Button>

// Icon button
<Button color="zinc" outline>
  <PlusIcon className="w-4 h-4 mr-2" />
  Add Item
</Button>
```

### Link Styles
```tsx
// Inline link
<a href="#" className="text-cyan-400 hover:text-cyan-300 underline">
  View details
</a>

// Navigation link
<Link 
  href="/prophecy-codex" 
  className="text-gray-300 hover:text-white transition-colors"
>
  Prophecy Codex
</Link>
```

### Loading States
```tsx
// Skeleton loader
<div className="animate-pulse">
  <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
</div>

// Spinner
<div className="flex items-center justify-center py-8">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
</div>

// Loading text
<p className="text-gray-400 animate-pulse">Loading...</p>
```

---

## 📚 Resources

- **Catalyst UI Docs**: https://catalyst.tailwindui.com/docs
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Heroicons**: https://heroicons.com
- **WCAG Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

## 🔄 Version History

**v1.0.0** - November 1, 2025
- Initial design system documentation
- Validated on Prophecy Codex Enhanced page
- Established mandatory standards for Phase 2+ development

---

**This design system is the single source of truth for all UI decisions. When in doubt, refer to this document.**
