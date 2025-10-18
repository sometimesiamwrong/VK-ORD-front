# ActFormPage Migration Guide: useState → React Hook Form + Zod

## Overview

This guide documents the migration of ActFormPage from manual useState management to React Hook Form with Zod validation.

**Current State:** 1,033 lines using useState for form management
**Target State:** React Hook Form + Zod validation with proper type safety

## Why Migrate?

1. **Better Performance** - RHF only re-renders changed fields
2. **Built-in Validation** - Zod schema provides type-safe validation
3. **Less Boilerplate** - No manual onChange handlers for each field
4. **Better UX** - Field-level validation feedback
5. **Easier Testing** - Validation logic separated from UI

## Migration Strategy

### Phase 1: Setup (COMPLETED ✅)
- [x] Install dependencies (react-hook-form, @hookform/resolvers, zod)
- [x] Create Zod schemas (actFormSchema.ts, actFormSchema.simple.ts)
- [x] Create hooks for InvoicesController and StatisticsController

### Phase 2: Incremental Migration

#### Step 1: Initialize React Hook Form
```typescript
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { simpleActFormSchema, getDefaultSimpleActFormValues } from './schemas/actFormSchema.simple'

const {
  control,
  handleSubmit,
  watch,
  setValue,
  formState: { errors, isSubmitting },
  reset,
} = useForm({
  resolver: zodResolver(simpleActFormSchema),
  defaultValues: getDefaultSimpleActFormValues(),
  mode: 'onChange', // Validate on change
})
```

#### Step 2: Replace useState with watch()
**Before:**
```typescript
const [formData, setFormData] = useState<ActFormData>({...})
const totalAmount = formData.totalAmount
```

**After:**
```typescript
const totalAmount = watch('totalAmount')
const vatRate = watch('vatRate')
```

#### Step 3: Convert Simple Fields
**Before:**
```typescript
<TextField
  value={formData.number}
  onChange={(e) => handleFieldChange('number', e.target.value)}
/>
```

**After:**
```typescript
<Controller
  name="number"
  control={control}
  render={({ field, fieldState }) => (
    <TextField
      {...field}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  )}
/>
```

#### Step 4: Convert Array Fields (distributions, statistics)
**Before:**
```typescript
const [formData, setFormData] = useState({distributions: []})
const handleAddDistribution = () => {
  setFormData(prev => ({
    ...prev,
    distributions: [...prev.distributions, newDist]
  }))
}
```

**After:**
```typescript
const { fields, append, remove } = useFieldArray({
  control,
  name: 'distributions'
})

const handleAddDistribution = () => {
  append({
    contractId: '',
    amount: 0,
    vatRate: 20,
    // ...
  })
}

// In render:
{fields.map((field, index) => (
  <div key={field.id}>
    <Controller
      name={`distributions.${index}.amount`}
      control={control}
      render={({field}) => <TextField {...field} type="number" />}
    />
  </div>
))}
```

#### Step 5: Auto-calculate VAT with useEffect
```typescript
useEffect(() => {
  const subscription = watch((value, { name }) => {
    if (name === 'totalAmount' || name === 'vatRate') {
      if (value.autoCalculate) {
        const vatAmount = (value.totalAmount || 0) * ((value.vatRate || 0) / 100)
        const amountWithoutVat = (value.totalAmount || 0) - vatAmount

        setValue('vatAmount', Number(vatAmount.toFixed(2)), { shouldValidate: false })
        setValue('amountWithoutVat', Number(amountWithoutVat.toFixed(2)), { shouldValidate: false })
      }
    }
  })

  return () => subscription.unsubscribe()
}, [watch, setValue])
```

#### Step 6: Update Submit Handlers
**Before:**
```typescript
const handleSaveDraft = async () => {
  if (!validateForm()) return
  // ... save logic
}
```

**After:**
```typescript
const onSaveDraft = handleSubmit(async (data) => {
  try {
    toast.info('Сохранение черновика...')

    const payload: CreateActRequest = {
      companyId: data.companyId,
      contractId: data.contractId,
      // ... map data to API format
    }

    await createActMutation.mutateAsync(payload)
    toast.success('Черновик создан')
  } catch (error) {
    toast.error(error?.message || 'Ошибка при сохранении')
  }
})
```

#### Step 7: Load Data on Edit
**Before:**
```typescript
useEffect(() => {
  if (actDetails) {
    setFormData({...actDetails})
  }
}, [actDetails])
```

**After:**
```typescript
useEffect(() => {
  if (actDetails) {
    reset({
      number: actDetails.number || '',
      companyId: actDetails.companyId,
      // ... map all fields
    })
  }
}, [actDetails, reset])
```

## Special Considerations

### 1. Autocomplete Components
Material UI Autocomplete needs Controller wrapper:
```typescript
<Controller
  name="contractId"
  control={control}
  render={({ field, fieldState }) => (
    <Autocomplete
      value={contracts.find(c => c.externalId === field.value) || null}
      onChange={(_, value) => field.onChange(value?.externalId || '')}
      options={contracts}
      renderInput={(params) => (
        <TextField
          {...params}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  )}
/>
```

### 2. Date Inputs
Dates remain as strings to work with HTML date inputs:
```typescript
<Controller
  name="periodStart"
  control={control}
  render={({ field, fieldState }) => (
    <TextField
      {...field}
      type="date"
      InputLabelProps={{ shrink: true }}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  )}
/>
```

### 3. Nested Field Arrays
For distributions with creativeIds:
```typescript
const { fields: distributionFields } = useFieldArray({
  control,
  name: 'distributions'
})

// For each distribution's creative IDs:
<Controller
  name={`distributions.${index}.creativeIds`}
  control={control}
  render={({ field }) => (
    <Autocomplete
      multiple
      value={creatives.filter(c => field.value.includes(c.externalId))}
      onChange={(_, value) => field.onChange(value.map(v => v.externalId))}
      options={creatives}
    />
  )}
/>
```

## Testing Checklist

After migration, verify:
- [ ] Form loads with default values
- [ ] Form loads existing act data correctly
- [ ] All fields validate on blur/change
- [ ] Error messages display correctly
- [ ] VAT auto-calculation works
- [ ] Distributions can be added/removed
- [ ] Statistics can be added/removed
- [ ] Save draft works
- [ ] Submit to VK ORD works
- [ ] Delete works
- [ ] All navigation works
- [ ] No console errors

## Performance Benefits

Expected improvements:
- **Initial render**: ~same
- **Field updates**: 60-80% faster (only changed field re-renders)
- **Validation**: Built into form state, no manual checks
- **Type safety**: 100% type-safe with Zod inference

## Next Steps

1. Create backup branch before migration
2. Migrate Tab 1 (Main Data) first
3. Test thoroughly
4. Migrate Tab 2 (Distribution)
5. Migrate Tab 3 (Statistics)
6. Final integration testing
7. Update tests

## References

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [MUI + RHF Integration](https://react-hook-form.com/get-started#IntegratingwithUIlibraries)
