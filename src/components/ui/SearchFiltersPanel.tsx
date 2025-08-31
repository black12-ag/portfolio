import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Filter,
  SortAsc,
  SortDesc,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useSearchFilters, UseSearchFiltersOptions } from '@/hooks/useSearchFilters';
import { SearchFilter, FilterGroup, SortOption } from '@/lib/searchFiltering';

export interface SearchFiltersPanelProps extends UseSearchFiltersOptions {
  className?: string;
  isCollapsible?: boolean;
  showSortOptions?: boolean;
  showClearAll?: boolean;
  showActiveCount?: boolean;
  compactMode?: boolean;
}

export const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  className,
  isCollapsible = false,
  showSortOptions = true,
  showClearAll = true,
  showActiveCount = true,
  compactMode = false,
  ...filterOptions
}) => {
  const {
    filterGroups,
    activeFiltersCount,
    sortOptions,
    currentSort,
    toggleFilter,
    updateFilterValue,
    clearFilter,
    clearAllFilters,
    resetFiltersToDefault,
    changeSorting,
    applySmartFilters,
    isFilterActive
  } = useSearchFilters(filterOptions);

  const [isPanelExpanded, setIsPanelExpanded] = useState(!isCollapsible);

  const renderFilterControl = (filter: SearchFilter) => {
    const isActive = filter.isActive;

    switch (filter.dataType) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor={filter.id} className="text-sm font-medium">
              {filter.label}
            </Label>
            <Switch
              id={filter.id}
              checked={isActive}
              onCheckedChange={() => toggleFilter(filter.id)}
            />
          </div>
        );

      case 'number':
        if (filter.operator === 'between' && Array.isArray(filter.value)) {
          return (
            <div className="space-y-2">
              <Label htmlFor={filter.id} className="text-sm font-medium">
                {filter.label}
              </Label>
              <div className="px-2">
                <Slider
                  value={filter.value}
                  onValueChange={(value) => updateFilterValue(filter.id, value)}
                  min={0}
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>${filter.value[0]}</span>
                  <span>${filter.value[1]}</span>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-2">
              <Label htmlFor={filter.id} className="text-sm font-medium flex items-center gap-2">
                {filter.label}
                {isActive && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => clearFilter(filter.id)}
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Label>
              <Input
                id={filter.id}
                type="number"
                value={filter.value || ''}
                onChange={(e) => updateFilterValue(filter.id, Number(e.target.value) || 0)}
                placeholder={`Enter ${filter.label.toLowerCase()}`}
                className="w-full"
              />
            </div>
          );
        }

      case 'string':
        if (filter.operator === 'equals' && ['category', 'status'].some(field => filter.field.includes(field))) {
          // Dropdown for predefined options
          return (
            <div className="space-y-2">
              <Label htmlFor={filter.id} className="text-sm font-medium flex items-center gap-2">
                {filter.label}
                {isActive && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => clearFilter(filter.id)}
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Label>
              <Select
                value={isActive ? filter.value : ''}
                onValueChange={(value) => updateFilterValue(filter.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All {filter.label}</SelectItem>
                  {/* Add predefined options based on filter type */}
                  {filter.field.includes('status') && (
                    <>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </>
                  )}
                  {filter.field.includes('category') && (
                    <>
                      <SelectItem value="Users">Users</SelectItem>
                      <SelectItem value="Properties">Properties</SelectItem>
                      <SelectItem value="Bookings">Bookings</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          );
        } else {
          return (
            <div className="space-y-2">
              <Label htmlFor={filter.id} className="text-sm font-medium flex items-center gap-2">
                {filter.label}
                {isActive && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => clearFilter(filter.id)}
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Label>
              <Input
                id={filter.id}
                type="text"
                value={filter.value || ''}
                onChange={(e) => updateFilterValue(filter.id, e.target.value)}
                placeholder={`Enter ${filter.label.toLowerCase()}`}
                className="w-full"
              />
            </div>
          );
        }

      case 'array':
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor={filter.id} className="text-sm font-medium">
              {filter.label}
            </Label>
            <Switch
              id={filter.id}
              checked={isActive}
              onCheckedChange={() => toggleFilter(filter.id)}
            />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor={filter.id} className="text-sm font-medium">
              {filter.label}
            </Label>
            <Switch
              id={filter.id}
              checked={isActive}
              onCheckedChange={() => toggleFilter(filter.id)}
            />
          </div>
        );
    }
  };

  const FilterGroupComponent = ({ group }: { group: FilterGroup }) => {
    const [isExpanded, setIsExpanded] = useState(group.isExpanded ?? true);

    if (group.isCollapsible) {
      return (
        <Collapsible
          key={group.id}
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="space-y-2"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-auto w-full items-center justify-between p-2 font-medium hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {group.icon && <span className="text-lg">{group.icon}</span>}
                <span className="text-sm">{group.label}</span>
                {group.filters.some(f => f.isActive) && (
                  <Badge variant="secondary" className="h-5 text-xs">
                    {group.filters.filter(f => f.isActive).length}
                  </Badge>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 px-2 pb-2">
            {group.filters.map(renderFilterControl)}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <div key={group.id} className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          {group.icon && <span className="text-lg">{group.icon}</span>}
          <h4 className="text-sm font-medium">{group.label}</h4>
          {group.filters.some(f => f.isActive) && (
            <Badge variant="secondary" className="h-5 text-xs">
              {group.filters.filter(f => f.isActive).length}
            </Badge>
          )}
        </div>
        <div className="space-y-3 px-2">
          {group.filters.map(renderFilterControl)}
        </div>
      </div>
    );
  };

  if (compactMode) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {/* Active Filters as Badges */}
        {filterGroups.flatMap(group => 
          group.filters.filter(f => f.isActive).map(filter => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {filter.label}
              {filter.dataType === 'number' && `: ${filter.value}`}
              {filter.dataType === 'string' && filter.value && `: ${filter.value}`}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => clearFilter(filter.id)}
                className="h-3 w-3 p-0 hover:bg-destructive/20"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))
        )}

        {/* Sort Options */}
        {showSortOptions && (
          <Select value={`${currentSort.field}_${currentSort.direction}`} onValueChange={(value) => {
            const [field, direction] = value.split('_');
            const sortOption = sortOptions.find(s => s.field === field && s.direction === direction);
            if (sortOption) changeSorting(sortOption);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem 
                  key={`${option.field}_${option.direction}`}
                  value={`${option.field}_${option.direction}`}
                >
                  <div className="flex items-center gap-2">
                    {option.direction === 'asc' ? (
                      <SortAsc className="h-3 w-3" />
                    ) : (
                      <SortDesc className="h-3 w-3" />
                    )}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear All */}
        {showClearAll && activeFiltersCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={clearAllFilters}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>
    );
  }

  const panelContent = (
    <>
      {/* Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {showActiveCount && activeFiltersCount > 0 && (
              <Badge variant="default" className="h-6">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => applySmartFilters(true)}
              className="flex items-center gap-1 text-xs"
            >
              <Sparkles className="h-3 w-3" />
              Smart
            </Button>
            {showClearAll && activeFiltersCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={resetFiltersToDefault}
              className="flex items-center gap-1 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sort Options */}
        {showSortOptions && (
          <>
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <SortAsc className="h-4 w-4" />
                Sort By
              </h4>
              <Select 
                value={`${currentSort.field}_${currentSort.direction}`} 
                onValueChange={(value) => {
                  const [field, direction] = value.split('_');
                  const sortOption = sortOptions.find(s => s.field === field && s.direction === direction);
                  if (sortOption) changeSorting(sortOption);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem 
                      key={`${option.field}_${option.direction}`}
                      value={`${option.field}_${option.direction}`}
                    >
                      <div className="flex items-center gap-2">
                        {option.direction === 'asc' ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        )}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
          </>
        )}

        {/* Filter Groups */}
        <div className="space-y-4">
          {filterGroups.map(group => <FilterGroupComponent key={group.id} group={group} />)}
        </div>
      </CardContent>
    </>
  );

  if (isCollapsible) {
    return (
      <Collapsible
        open={isPanelExpanded}
        onOpenChange={setIsPanelExpanded}
        className={className}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showActiveCount && activeFiltersCount > 0 && (
                <Badge variant="default" className="h-5">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            {isPanelExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            {panelContent}
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Card className={className}>
      {panelContent}
    </Card>
  );
};
