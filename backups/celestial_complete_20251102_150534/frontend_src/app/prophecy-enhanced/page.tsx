/**
 * Prophecy Codex - Enhanced with Catalyst UI
 * Phase 2 Week 11-12 Implementation
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Badge,
  Heading,
  Text,
  Input,
  Select,
  Textarea,
  Field,
  Label,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '@/components/catalyst';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { prophecySchema, type ProphecyFormData } from '@/lib/validations/prophecy';
import { showToast } from '@/lib/toast';

const mockProphecies = [
  {
    id: '1',
    title: 'Joel 2:31 - Blood Moon Prophecy',
    scriptureReference: 'Joel 2:31',
    fullText: 'The sun will be turned to darkness and the moon to blood before the coming of the great and dreadful day of the LORD.',
    category: 'celestial_sign' as const,
    fulfillmentStatus: 'partially_fulfilled' as const,
    significanceLevel: 'critical' as const,
    correlatedEvents: 4,
  },
  {
    id: '2',
    title: 'Matthew 24:29 - Signs in Heavens',
    scriptureReference: 'Matthew 24:29',
    fullText: 'The sun will be darkened, and the moon will not give its light; the stars will fall from the sky.',
    category: 'celestial_sign' as const,
    fulfillmentStatus: 'unfulfilled' as const,
    significanceLevel: 'high' as const,
    correlatedEvents: 8,
  },
  {
    id: '3',
    title: 'Revelation 6:12 - Sixth Seal',
    scriptureReference: 'Revelation 6:12',
    fullText: 'The sun turned black and the whole moon turned blood red.',
    category: 'celestial_sign' as const,
    fulfillmentStatus: 'fulfilled' as const,
    significanceLevel: 'critical' as const,
    correlatedEvents: 2,
  },
];

export default function ProphecyCodexEnhancedPage() {
  const [prophecies] = useState(mockProphecies);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(prophecySchema),
    defaultValues: {
      fulfillmentStatus: 'unfulfilled' as const,
      significanceLevel: 'medium' as const,
      category: 'celestial_sign' as const,
    },
  });

  const onSubmit = async (data: ProphecyFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Prophecy data:', data);
      showToast.prophecySaved();
      setShowAddForm(false);
      reset();
    } catch (error) {
      showToast.error('Failed to save prophecy');
      console.error(error);
    }
  };

  const filteredProphecies = prophecies.filter((p) => {
    const matchesSearch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const statusColors = {
    fulfilled: 'green' as const,
    partially_fulfilled: 'yellow' as const,
    unfulfilled: 'red' as const,
  };

  const significanceColors = {
    low: 'zinc' as const,
    medium: 'blue' as const,
    high: 'purple' as const,
    critical: 'red' as const,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <Heading level={1} className="text-4xl font-bold text-white">
              📜 Prophecy Codex
            </Heading>
            <Text className="text-gray-400 mt-2">
              Biblical prophecies with celestial correlations
            </Text>
          </div>
          <Button color="blue" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Prophecy'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="bordered">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-400">{prophecies.length}</div>
              <div className="text-sm text-gray-300 mt-1">Total Prophecies</div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-400">
                {prophecies.filter((p) => p.fulfillmentStatus === 'fulfilled').length}
              </div>
              <div className="text-sm text-gray-300 mt-1">Fulfilled</div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-red-400">
                {prophecies.filter((p) => p.fulfillmentStatus === 'unfulfilled').length}
              </div>
              <div className="text-sm text-gray-300 mt-1">Unfulfilled</div>
            </CardContent>
          </Card>
        </div>

        {showAddForm && (
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Add New Prophecy</CardTitle>
              <CardDescription>Enter biblical prophecy details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <Label className="text-gray-200">Title *</Label>
                    <Input
                      {...register('title')}
                      placeholder="Joel 2:31 - Blood Moon"
                      invalid={!!errors.title}
                      className="bg-zinc-800 text-white border-zinc-700"
                    />
                    {errors.title && (
                      <Text className="text-red-400 text-sm">{errors.title.message}</Text>
                    )}
                  </Field>

                  <Field>
                    <Label className="text-gray-200">Scripture Reference *</Label>
                    <Input
                      {...register('scriptureReference')}
                      placeholder="Joel 2:31"
                      invalid={!!errors.scriptureReference}
                      className="bg-zinc-800 text-white border-zinc-700"
                    />
                    {errors.scriptureReference && (
                      <Text className="text-red-400 text-sm">{errors.scriptureReference.message}</Text>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field>
                    <Label className="text-gray-200">Book *</Label>
                    <Input 
                      {...register('book')} 
                      placeholder="Joel" 
                      invalid={!!errors.book}
                      className="bg-zinc-800 text-white border-zinc-700"
                    />
                    {errors.book && (
                      <Text className="text-red-400 text-sm">{errors.book.message}</Text>
                    )}
                  </Field>

                  <Field>
                    <Label className="text-gray-200">Chapter *</Label>
                    <Input
                      type="number"
                      {...register('chapter', { valueAsNumber: true })}
                      placeholder="2"
                      invalid={!!errors.chapter}
                      className="bg-zinc-800 text-white border-zinc-700"
                    />
                  </Field>

                  <Field>
                    <Label className="text-gray-200">Verse *</Label>
                    <Input
                      type="number"
                      {...register('verseStart', { valueAsNumber: true })}
                      placeholder="31"
                      invalid={!!errors.verseStart}
                      className="bg-zinc-800 text-white border-zinc-700"
                    />
                  </Field>
                </div>

                <Field>
                  <Label className="text-gray-200">Full Text *</Label>
                  <Textarea
                    {...register('fullText')}
                    rows={3}
                    placeholder="Enter scripture text..."
                    invalid={!!errors.fullText}
                    className="bg-zinc-800 text-white border-zinc-700"
                  />
                  {errors.fullText && (
                    <Text className="text-red-400 text-sm">{errors.fullText.message}</Text>
                  )}
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field>
                    <Label className="text-gray-200">Category *</Label>
                    <Select {...register('category')} className="bg-zinc-800 text-white border-zinc-700">
                      <option value="celestial_sign">Celestial Sign</option>
                      <option value="terrestrial_event">Terrestrial Event</option>
                      <option value="spiritual_event">Spiritual Event</option>
                    </Select>
                  </Field>

                  <Field>
                    <Label className="text-gray-200">Status *</Label>
                    <Select {...register('fulfillmentStatus')} className="bg-zinc-800 text-white border-zinc-700">
                      <option value="unfulfilled">Unfulfilled</option>
                      <option value="partially_fulfilled">Partially Fulfilled</option>
                      <option value="fulfilled">Fulfilled</option>
                    </Select>
                  </Field>

                  <Field>
                    <Label className="text-gray-200">Significance *</Label>
                    <Select {...register('significanceLevel')} className="bg-zinc-800 text-white border-zinc-700">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </Select>
                  </Field>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" color="blue" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Prophecy'}
                  </Button>
                  <Button
                    type="button"
                    color="zinc"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <Label className="text-gray-200">Search</Label>
                <Input
                  placeholder="Search prophecies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-800 text-white border-zinc-700"
                />
              </Field>

              <Field>
                <Label className="text-gray-200">Category</Label>
                <Select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-zinc-800 text-white border-zinc-700"
                >
                  <option value="all">All Categories</option>
                  <option value="celestial_sign">Celestial Signs</option>
                  <option value="terrestrial_event">Terrestrial Events</option>
                  <option value="spiritual_event">Spiritual Events</option>
                </Select>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Prophecies ({filteredProphecies.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader className="text-gray-300">Title</TableHeader>
                  <TableHeader className="text-gray-300">Scripture</TableHeader>
                  <TableHeader className="text-gray-300">Status</TableHeader>
                  <TableHeader className="text-gray-300">Significance</TableHeader>
                  <TableHeader className="text-gray-300">Events</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProphecies.map((prophecy) => (
                  <TableRow key={prophecy.id}>
                    <TableCell className="font-medium text-white">{prophecy.title}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-zinc-800 px-2 py-1 rounded text-cyan-300">
                        {prophecy.scriptureReference}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge color={statusColors[prophecy.fulfillmentStatus]}>
                        {prophecy.fulfillmentStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color={significanceColors[prophecy.significanceLevel]}>
                        {prophecy.significanceLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-blue-400 font-semibold">
                        {prophecy.correlatedEvents}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
