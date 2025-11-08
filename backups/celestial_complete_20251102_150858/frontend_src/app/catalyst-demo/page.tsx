/**
 * Catalyst UI Demo Page
 * 
 * Showcases all available Catalyst components for Phase 2 development.
 * This page demonstrates buttons, badges, alerts, forms, and other UI elements
 * that will be used in Prophecy Codex and Watchman's View.
 */

'use client';

import React, { useState } from 'react';
import {
  Button,
  Badge,
  AlertBanner,
  Heading,
  Text,
  Divider,
  Field,
  FieldGroup,
  Label,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '@/components/catalyst';

export default function CatalystDemoPage() {
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <Heading level={1} className="text-4xl font-bold text-white mb-4">
            🎨 Catalyst UI Kit Demo
          </Heading>
          <Text className="text-xl text-gray-400">
            Component showcase for Phobetron Phase 2 development
          </Text>
        </div>

        <Divider className="border-gray-800" />

        {/* Buttons Section */}
        <section>
          <Heading level={2} className="text-2xl font-bold text-white mb-6">
            Buttons
          </Heading>
          <div className="flex flex-wrap gap-4">
            <Button color="blue">Primary Button</Button>
            <Button color="cyan">Secondary Button</Button>
            <Button color="green">Success Button</Button>
            <Button color="red">Danger Button</Button>
            <Button color="zinc" outline>Outline Button</Button>
            <Button color="blue" disabled>Disabled Button</Button>
          </div>
        </section>

        <Divider className="border-gray-800" />

        {/* Badges Section */}
        <section>
          <Heading level={2} className="text-2xl font-bold text-white mb-6">
            Badges
          </Heading>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge color="blue">Celestial Sign</Badge>
            <Badge color="green">Fulfilled</Badge>
            <Badge color="yellow">Partially Fulfilled</Badge>
            <Badge color="red">Unfulfilled</Badge>
            <Badge color="purple">High Significance</Badge>
            <Badge color="zinc">Historical</Badge>
          </div>
        </section>

        <Divider className="border-gray-800" />

        {/* Alerts Section */}
        <section>
          <Heading level={2} className="text-2xl font-bold text-white mb-6">
            Alert Banners
          </Heading>
          <div className="space-y-4">
            <AlertBanner color="blue">
              <strong>Blood Moon Approaching:</strong> Total lunar eclipse in 7 days (November 8, 2025)
            </AlertBanner>
            <AlertBanner color="green">
              <strong>Event Correlation Found:</strong> Jupiter-Saturn conjunction matches Revelation 12 prophecy
            </AlertBanner>
            <AlertBanner color="yellow">
              <strong>Warning:</strong> High celestial activity detected this month
            </AlertBanner>
            <AlertBanner color="red">
              <strong>Critical Alert:</strong> NEO Apophis close approach within 60 days
            </AlertBanner>
          </div>
        </section>

        <Divider className="border-gray-800" />

        {/* Form Components Section */}
        <section>
          <Heading level={2} className="text-2xl font-bold text-white mb-6">
            Form Components
          </Heading>
          <form className="space-y-6 max-w-2xl">
            <FieldGroup>
              <Field>
                <Label>Prophecy Title</Label>
                <Input 
                  name="title" 
                  placeholder="e.g., Joel 2:31 - Blood Moon Prophecy"
                />
              </Field>

              <Field>
                <Label>Scripture Reference</Label>
                <Input 
                  name="reference" 
                  placeholder="e.g., Joel 2:31"
                />
              </Field>

              <Field>
                <Label>Category</Label>
                <Select name="category">
                  <option>Select a category</option>
                  <option value="celestial_sign">Celestial Sign</option>
                  <option value="terrestrial_event">Terrestrial Event</option>
                  <option value="spiritual_event">Spiritual Event</option>
                </Select>
              </Field>

              <Field>
                <Label>Interpretation</Label>
                <Textarea 
                  name="interpretation" 
                  rows={4}
                  placeholder="Provide your interpretation of this prophecy..."
                />
              </Field>

              <Field>
                <Checkbox 
                  checked={checkboxChecked}
                  onChange={setCheckboxChecked}
                >
                  High Significance Event
                </Checkbox>
              </Field>

              <Field>
                <Switch
                  checked={switchEnabled}
                  onChange={setSwitchEnabled}
                >
                  Enable Alerts for This Prophecy
                </Switch>
              </Field>
            </FieldGroup>

            <div className="flex gap-4">
              <Button type="submit" color="blue">
                Save Prophecy
              </Button>
              <Button type="button" color="zinc" outline>
                Cancel
              </Button>
            </div>
          </form>
        </section>

        <Divider className="border-gray-800" />

        {/* Table Section */}
        <section>
          <Heading level={2} className="text-2xl font-bold text-white mb-6">
            Table Component
          </Heading>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHead>
                <TableRow>
                  <TableHeader>Event</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Prophecy Match</TableHeader>
                  <TableHeader>Significance</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Blood Moon</TableCell>
                  <TableCell>Nov 8, 2025</TableCell>
                  <TableCell>
                    <Badge color="red">Lunar Eclipse</Badge>
                  </TableCell>
                  <TableCell>Joel 2:31</TableCell>
                  <TableCell>
                    <Badge color="purple">High</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jupiter-Saturn Conjunction</TableCell>
                  <TableCell>Dec 21, 2025</TableCell>
                  <TableCell>
                    <Badge color="blue">Alignment</Badge>
                  </TableCell>
                  <TableCell>Revelation 12:1</TableCell>
                  <TableCell>
                    <Badge color="purple">Critical</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Apophis Approach</TableCell>
                  <TableCell>Apr 13, 2029</TableCell>
                  <TableCell>
                    <Badge color="yellow">NEO</Badge>
                  </TableCell>
                  <TableCell>Revelation 8:10</TableCell>
                  <TableCell>
                    <Badge color="red">Critical</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        <Divider className="border-gray-800" />

        {/* Footer */}
        <div className="text-center text-gray-500 pt-8">
          <Text>
            ✨ All Catalyst components are now ready for Phase 2 development
          </Text>
        </div>
      </div>
    </div>
  );
}
